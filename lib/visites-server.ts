import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenirAccessTokenValide, envoyerEmailGmail, GmailNonConnecteError, GmailRevoqueError } from "@/lib/google";

export class VisiteError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function resoudreUserIdParSlug(slug: string): Promise<string | null> {
  const { data } = await supabaseAdmin.from("cave_parametres").select("user_id").eq("slug_public", slug).maybeSingle();
  return data?.user_id ?? null;
}

// --- Dates locales, sans jamais passer par toISOString()/new Date(str)
// bruts (les deux interprètent une chaîne "AAAA-MM-JJ" en UTC, ce qui
// décale l'affichage d'un jour dans les fuseaux en avance sur UTC —
// c'est le bug "Aujourd'hui/Demain inversés" du brief). Toute date
// calendaire ici passe par ces helpers, jamais par un parsing implicite.
function dateLocale(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateDuJour(): string {
  return dateLocale(new Date());
}

function ajouterJours(dateStr: string, jours: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + jours);
  return dateLocale(date);
}

// 1=lundi..7=dimanche (ISO 8601) — construit depuis des composants
// AAAA/MM/JJ explicites (jamais via new Date(chaîne)), donc immunisé
// contre tout décalage de fuseau horaire.
function jourSemaineIso(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const jsDay = new Date(y, m - 1, d).getDay();
  return jsDay === 0 ? 7 : jsDay;
}

function minutesDepuisMinuit(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return h * 60 + m;
}

function minutesVersHeure(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function heureActuelle(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// V4 — une disponibilité récurrente couvre désormais une PLAGE large
// (ex: 10h-18h), pas un seul créneau fixe. Cette fonction découpe la
// plage en créneaux de départ possibles pour UNE formule donnée, dos à
// dos selon sa durée, en s'assurant que chaque visite se termine bien
// dans la fenêtre (ex: plage 10h-18h, formule 1h -> 10h,11h,...,17h ;
// formule 2h -> 10h,12h,14h,16h). Une formule dont la durée dépasse la
// plage entière ne produit aucun horaire (liste vide), jamais une erreur.
function genererHeuresDebutPossibles(fenetreDebut: string, fenetreFin: string, dureeMinutes: number): string[] {
  const debut = minutesDepuisMinuit(fenetreDebut);
  const fin = minutesDepuisMinuit(fenetreFin);
  const heures: string[] = [];
  for (let t = debut; t + dureeMinutes <= fin; t += dureeMinutes) {
    heures.push(minutesVersHeure(t));
  }
  return heures;
}

// Capacité restante calculée à la volée depuis les réservations actives
// (annule = false, quel que soit le statut — une demande en_attente
// bloque donc bien la place) — jamais un compteur stocké, pour ne
// jamais pouvoir se désynchroniser (RG anti-surbooking).
export async function getCapaciteRestante(creneauId: string): Promise<{ capaciteMax: number; reservees: number; restante: number }> {
  const { data: creneau, error } = await supabaseAdmin.from("visites_creneaux").select("capacite_max").eq("id", creneauId).maybeSingle();
  if (error || !creneau) throw new VisiteError("Créneau introuvable.", 404);

  const { data: reservations } = await supabaseAdmin
    .from("visites_reservations")
    .select("personnes")
    .eq("creneau_id", creneauId)
    .eq("annule", false);

  const reservees = (reservations ?? []).reduce((total, r) => total + r.personnes, 0);
  return { capaciteMax: creneau.capacite_max, reservees, restante: creneau.capacite_max - reservees };
}

// V5 — un créneau réel (ponctuel ou matérialisé depuis une règle
// récurrente) dont la date/heure de fin est dépassée n'a plus lieu
// d'apparaître dans "Mes disponibilités" : vérification opportuniste à
// chaque affichage de l'onglet (même principe que
// verifierEtRelancerDemandes, pas de job cron), jamais de suppression
// réelle — juste archive=true, la ligne reste consultable en base pour
// l'historique.
export async function archiverCreneauxPasses(userId: string): Promise<void> {
  const aujourdhui = dateDuJour();
  const heure = heureActuelle();

  const { data: creneaux } = await supabaseAdmin
    .from("visites_creneaux")
    .select("id, date, heure_fin")
    .eq("user_id", userId)
    .eq("archive", false)
    .lte("date", aujourdhui);
  if (!creneaux?.length) return;

  const aArchiver = creneaux.filter((c) => c.date < aujourdhui || (c.date === aujourdhui && c.heure_fin <= heure)).map((c) => c.id);
  if (!aArchiver.length) return;

  await supabaseAdmin.from("visites_creneaux").update({ archive: true }).in("id", aArchiver);
}

// Point de jonction entre une règle récurrente (jamais matérialisée à
// l'avance) et une réservation réelle : cherche un visites_creneaux déjà
// existant pour cette (formule, date, heure) ; à défaut, cherche une
// règle récurrente active dont la plage horaire contient cet horaire de
// départ EXACT pour la durée de cette formule (découpage dos à dos, voir
// genererHeuresDebutPossibles), sans exception ce jour-là, et matérialise
// alors un vrai créneau — seulement à ce moment précis, jamais en avance
// pour toutes les semaines futures (exigence explicite du brief).
// Retourne null si rien ne correspond.
export async function resoudreCreneauPourReservation(
  userId: string,
  formuleId: string,
  date: string,
  heureDebut: string
): Promise<{ id: string; heureFin: string; capaciteMax: number } | null> {
  const { data: existant } = await supabaseAdmin
    .from("visites_creneaux")
    .select("id, heure_fin, capacite_max")
    .eq("user_id", userId)
    .eq("formule_id", formuleId)
    .eq("date", date)
    .eq("heure_debut", heureDebut)
    .eq("archive", false)
    .maybeSingle();
  if (existant) return { id: existant.id, heureFin: existant.heure_fin, capaciteMax: existant.capacite_max };

  const { data: formule } = await supabaseAdmin.from("visites_formules").select("duree_minutes").eq("id", formuleId).eq("user_id", userId).maybeSingle();
  if (!formule) return null;

  const { data: regles } = await supabaseAdmin
    .from("visites_disponibilites_recurrentes")
    .select("id, heure_debut, heure_fin, capacite_max")
    .eq("user_id", userId)
    .eq("formule_id", formuleId)
    .eq("jour_semaine", jourSemaineIso(date))
    .eq("actif", true);

  let regleCorrespondante: { id: string; capacite_max: number } | null = null;
  for (const regle of regles ?? []) {
    if (genererHeuresDebutPossibles(regle.heure_debut, regle.heure_fin, formule.duree_minutes).includes(heureDebut)) {
      regleCorrespondante = regle;
      break;
    }
  }
  if (!regleCorrespondante) return null;

  const { data: exception } = await supabaseAdmin
    .from("visites_disponibilites_exceptions")
    .select("id")
    .eq("disponibilite_id", regleCorrespondante.id)
    .eq("date", date)
    .maybeSingle();
  if (exception) return null;

  const heureFin = minutesVersHeure(minutesDepuisMinuit(heureDebut) + formule.duree_minutes);

  const { data: creneau, error } = await supabaseAdmin
    .from("visites_creneaux")
    .insert({
      user_id: userId,
      formule_id: formuleId,
      disponibilite_id: regleCorrespondante.id,
      date,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      capacite_max: regleCorrespondante.capacite_max,
    })
    .select("id, heure_fin, capacite_max")
    .single();
  if (error) {
    // Course concurrente : quelqu'un a matérialisé ce créneau entre la
    // première vérification et l'insertion — on relit plutôt que
    // d'échouer.
    if (error.code === "23505") {
      const { data: retente } = await supabaseAdmin
        .from("visites_creneaux")
        .select("id, heure_fin, capacite_max")
        .eq("user_id", userId)
        .eq("formule_id", formuleId)
        .eq("date", date)
        .eq("heure_debut", heureDebut)
        .maybeSingle();
      if (retente) return { id: retente.id, heureFin: retente.heure_fin, capaciteMax: retente.capacite_max };
    }
    throw new VisiteError(error.message, 500);
  }
  return { id: creneau.id, heureFin: creneau.heure_fin, capaciteMax: creneau.capacite_max };
}

export type CreneauDisponible = {
  id: string;
  formule_id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  capaciteMax: number;
  restante: number;
};

const HORIZON_JOURS_DISPONIBILITE = 60;

// Créneaux à venir avec au moins une place, pour la page publique de
// réservation — fusionne les créneaux réels (ponctuels ou déjà
// matérialisés) et les occurrences virtuelles des règles récurrentes
// actives sur l'horizon (jamais stockées tant que personne ne réserve
// dessus). L'id des occurrences virtuelles n'est qu'une clé d'affichage
// (pas un uuid réel) : la réservation se fait par (formule, date,
// heure), résolue/matérialisée côté serveur au moment du booking.
export async function listerCreneauxDisponibles(userId: string, formuleId?: string): Promise<CreneauDisponible[]> {
  const aujourdhui = dateDuJour();
  const horizon = ajouterJours(aujourdhui, HORIZON_JOURS_DISPONIBILITE);

  let requeteReels = supabaseAdmin
    .from("visites_creneaux")
    .select("id, formule_id, date, heure_debut, heure_fin, capacite_max")
    .eq("user_id", userId)
    .eq("archive", false)
    .gte("date", aujourdhui)
    .lte("date", horizon);
  if (formuleId) requeteReels = requeteReels.eq("formule_id", formuleId);
  const { data: creneauxReels, error } = await requeteReels;
  if (error) throw new VisiteError(error.message, 500);

  const idsReels = (creneauxReels ?? []).map((c) => c.id);
  const { data: reservations } = idsReels.length
    ? await supabaseAdmin.from("visites_reservations").select("creneau_id, personnes").in("creneau_id", idsReels).eq("annule", false)
    : { data: [] };
  const reserveesParCreneau = new Map<string, number>();
  for (const r of reservations ?? []) {
    if (!r.creneau_id) continue;
    reserveesParCreneau.set(r.creneau_id, (reserveesParCreneau.get(r.creneau_id) ?? 0) + r.personnes);
  }

  const clefsReelles = new Set((creneauxReels ?? []).map((c) => `${c.formule_id}|${c.date}|${c.heure_debut}`));
  const resultatsReels: CreneauDisponible[] = (creneauxReels ?? [])
    .map((c) => ({
      id: c.id,
      formule_id: c.formule_id,
      date: c.date,
      heureDebut: c.heure_debut,
      heureFin: c.heure_fin,
      capaciteMax: c.capacite_max,
      restante: c.capacite_max - (reserveesParCreneau.get(c.id) ?? 0),
    }))
    .filter((c) => c.restante > 0);

  let requeteRegles = supabaseAdmin
    .from("visites_disponibilites_recurrentes")
    .select("id, formule_id, jour_semaine, heure_debut, heure_fin, capacite_max, visites_formules(duree_minutes)")
    .eq("user_id", userId)
    .eq("actif", true);
  if (formuleId) requeteRegles = requeteRegles.eq("formule_id", formuleId);
  const { data: regles } = await requeteRegles;

  const resultatsVirtuels: CreneauDisponible[] = [];
  for (const regle of regles ?? []) {
    const formuleAssociee = Array.isArray(regle.visites_formules) ? regle.visites_formules[0] : regle.visites_formules;
    const dureeMinutes = formuleAssociee?.duree_minutes;
    if (!dureeMinutes) continue;
    const heuresPossibles = genererHeuresDebutPossibles(regle.heure_debut, regle.heure_fin, dureeMinutes);
    if (heuresPossibles.length === 0) continue;

    const { data: exceptions } = await supabaseAdmin.from("visites_disponibilites_exceptions").select("date").eq("disponibilite_id", regle.id);
    const datesExceptees = new Set((exceptions ?? []).map((e) => e.date));
    for (let d = aujourdhui; d <= horizon; d = ajouterJours(d, 1)) {
      if (jourSemaineIso(d) !== regle.jour_semaine) continue;
      if (datesExceptees.has(d)) continue;
      for (const heureDebutPossible of heuresPossibles) {
        if (clefsReelles.has(`${regle.formule_id}|${d}|${heureDebutPossible}`)) continue;
        resultatsVirtuels.push({
          id: `virtuel:${regle.id}:${d}:${heureDebutPossible}`,
          formule_id: regle.formule_id,
          date: d,
          heureDebut: heureDebutPossible,
          heureFin: minutesVersHeure(minutesDepuisMinuit(heureDebutPossible) + dureeMinutes),
          capaciteMax: regle.capacite_max,
          restante: regle.capacite_max,
        });
      }
    }
  }

  return [...resultatsReels, ...resultatsVirtuels].sort((a, b) => (a.date === b.date ? a.heureDebut.localeCompare(b.heureDebut) : a.date.localeCompare(b.date)));
}

// Association facultative et automatique, jamais bloquante, jamais de
// création forcée de fiche — même principe que la "vente sans identité"
// de Cave étendu aux visiteurs (exigence explicite du brief). Email
// prioritaire (signal le plus fiable), téléphone en repli.
export async function matcherClient(userId: string, email?: string | null, telephone?: string | null): Promise<string | null> {
  if (email) {
    const { data } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("user_id", userId)
      .ilike("email", email.trim())
      .maybeSingle();
    if (data) return data.id;
  }
  if (telephone) {
    const { data } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("user_id", userId)
      .eq("telephone", telephone.trim())
      .maybeSingle();
    if (data) return data.id;
  }
  return null;
}

type FormuleTarification = {
  mode_tarification: "gratuit" | "total" | "par_personne";
  prix_par_personne: number;
  prix_total: number | null;
};

// Trois modes explicites (V2) — jamais un calcul opaque : gratuit (0€),
// total (prix fixe du créneau, indépendant du nombre de participants),
// par_personne (prix × participants, comportement historique).
function calculerMontant(formule: FormuleTarification, personnes: number): number {
  if (formule.mode_tarification === "gratuit") return 0;
  if (formule.mode_tarification === "total") return formule.prix_total ?? 0;
  return formule.prix_par_personne * personnes;
}

// "10:00" + 45 -> "10:45" — sert à déduire une heure de fin par défaut
// pour les visites sans créneau explicite, à partir de la durée
// déclarée de la formule.
function ajouterMinutes(heure: string, minutes: number): string {
  const [h, m] = heure.split(":").map(Number);
  const total = (((h * 60 + m + minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

type ReservationEmailInfo = { visiteur_nom: string; visiteur_email: string | null; date: string; heure_debut: string; heure_fin: string; personnes: number };

// Best-effort générique : un email qui échoue (Gmail non connecté/révoqué)
// ne doit jamais faire échouer l'action métier — voir lib/google.ts,
// déjà utilisé par Studio IA de la même façon. "SOI_MEME" envoie vers
// l'adresse du compte Gmail connecté lui-même (notifications au
// viticulteur — même principe que "M'envoyer un test" dans Studio IA).
async function envoyerEmailVisites(userId: string, destinataire: string | "SOI_MEME", subject: string, corpsHtml: string): Promise<void> {
  if (destinataire !== "SOI_MEME" && !destinataire) return;
  try {
    const { accessToken, email } = await obtenirAccessTokenValide(userId);
    await envoyerEmailGmail({ accessToken, from: email, to: destinataire === "SOI_MEME" ? email : destinataire, subject, corpsHtml });
  } catch (erreur) {
    if (erreur instanceof GmailNonConnecteError || erreur instanceof GmailRevoqueError) return;
    console.error("Échec de l'envoi d'email Visites :", erreur);
  }
}

async function envoyerDemandeRecue(userId: string, r: ReservationEmailInfo, nomFormule: string): Promise<void> {
  if (!r.visiteur_email) return;
  await envoyerEmailVisites(
    userId,
    r.visiteur_email,
    "Votre demande de visite a bien été reçue",
    `<p>Bonjour ${r.visiteur_nom},</p><p>Votre demande de visite (${nomFormule}) pour le ${r.date} de ${r.heure_debut} à ${r.heure_fin} a bien été reçue et est en attente de confirmation par le domaine.</p><p>Vous recevrez un email dès qu'elle sera validée.</p>`
  );
}

async function notifierVigneronNouvelleDemande(userId: string, r: ReservationEmailInfo, nomFormule: string): Promise<void> {
  await envoyerEmailVisites(
    userId,
    "SOI_MEME",
    "Nouvelle demande de visite à valider",
    `<p>Nouvelle demande : ${r.visiteur_nom} — ${nomFormule}, le ${r.date} de ${r.heure_debut} à ${r.heure_fin} (${r.personnes} pers.).</p><p>À valider ou refuser depuis l'onglet Demandes en ligne.</p>`
  );
}

// gratuite : si la formule est en mode 'gratuit', aucune mention de
// paiement, montant ou reçu (exigence explicite du brief V4) — le texte
// change entièrement plutôt que de simplement omettre une phrase, pour
// ne jamais laisser une formulation ambiguë ("le règlement se fera sur
// place" n'a aucun sens pour une visite gratuite).
async function envoyerVisiteConfirmee(userId: string, r: ReservationEmailInfo, nomFormule: string, gratuite: boolean): Promise<void> {
  if (!r.visiteur_email) return;
  const mentionPaiement = gratuite ? "" : "<p>Le paiement en ligne n'est pas encore disponible : le règlement se fera sur place.</p>";
  await envoyerEmailVisites(
    userId,
    r.visiteur_email,
    "Votre visite est confirmée",
    `<p>Bonjour ${r.visiteur_nom},</p><p>Votre visite (${nomFormule}) est confirmée pour le ${r.date} de ${r.heure_debut} à ${r.heure_fin}.</p>${mentionPaiement}<p>À très bientôt !</p>`
  );
}

async function envoyerExcuseRefus(userId: string, r: ReservationEmailInfo, nomFormule: string): Promise<void> {
  if (!r.visiteur_email) return;
  await envoyerEmailVisites(
    userId,
    r.visiteur_email,
    "Votre demande de visite n'a pas pu être confirmée",
    `<p>Bonjour ${r.visiteur_nom},</p><p>Nous sommes désolés, votre demande de visite (${nomFormule}) du ${r.date} de ${r.heure_debut} à ${r.heure_fin} n'a pas pu être confirmée.</p><p>N'hésitez pas à réserver un autre créneau.</p>`
  );
}

async function envoyerRelanceVigneron(userId: string, r: ReservationEmailInfo, nomFormule: string): Promise<void> {
  await envoyerEmailVisites(
    userId,
    "SOI_MEME",
    "Demande de visite en attente depuis plus de 24h",
    `<p>La demande de ${r.visiteur_nom} (${nomFormule}, le ${r.date} de ${r.heure_debut} à ${r.heure_fin}) est toujours en attente de réponse.</p><p>Le créneau reste bloqué tant qu'elle n'est pas traitée.</p>`
  );
}

export type ParametresReservation = {
  formuleId: string;
  creneauId?: string;
  date?: string;
  heureDebut?: string;
  heureFin?: string;
  personnes: number;
  visiteurNom: string;
  visiteurEmail?: string;
  visiteurTelephone?: string;
  langue?: string;
  origine: "en_ligne" | "walk_in" | "manuel";
  // Sélection explicite d'une fiche existante (choisie dans une liste,
  // pas devinée) — prioritaire sur le matching automatique par email/tél.
  clientId?: string;
};

async function emettreEvenementVisite(
  userId: string,
  typeEvenement: string,
  reservation: { id: string; visiteur_nom: string; date: string },
  declencheContenu: boolean,
  payloadSupplementaire: Record<string, unknown> = {}
): Promise<void> {
  await supabaseAdmin.from("evenements").insert({
    user_id: userId,
    type_evenement: typeEvenement,
    date: reservation.date,
    source: "visites",
    payload: { reservation_id: reservation.id, visiteur_nom: reservation.visiteur_nom, ...payloadSupplementaire },
    declenche_contenu: declencheContenu,
  });
}

// Point d'entrée unique pour créer une réservation, quelle que soit son
// origine — mêmes vérifications de capacité, même matching client, même
// événement Agenda. V3 : une réservation en ligne naît 'en_attente'
// (jamais confirmée directement, exigence explicite du brief) ; le
// créneau reste bloqué pendant l'attente car getCapaciteRestante ne
// filtre que sur annule=true, pas sur le statut.
// Vérification puis écriture (pas de verrou de ligne Postgres) — même
// niveau de rigueur que la vérification de stock Cave (RG13, voir
// lib/cave-server.ts).
export async function creerReservation(userId: string, params: ParametresReservation) {
  if (!params.formuleId) throw new VisiteError("Formule requise.", 400);
  if (!params.visiteurNom?.trim()) throw new VisiteError("Nom du visiteur requis.", 400);
  if (!Number.isInteger(params.personnes) || params.personnes <= 0) throw new VisiteError("Nombre de personnes invalide.", 400);
  if (params.origine === "en_ligne" && (!params.visiteurEmail?.trim() || !params.visiteurTelephone?.trim())) {
    throw new VisiteError("Email et téléphone sont tous les deux requis pour une réservation en ligne.", 400);
  }

  const { data: formule } = await supabaseAdmin
    .from("visites_formules")
    .select("id, nom, mode_tarification, prix_par_personne, prix_total, duree_minutes")
    .eq("id", params.formuleId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!formule) throw new VisiteError("Formule introuvable.", 404);

  // Quand un créneau est fourni, sa date/heure fait foi — jamais celle
  // envoyée par l'appelant (évite une réservation dont la date affichée
  // et le créneau décompté divergent si le client a un cache périmé).
  let date = params.date;
  let heureDebut = params.heureDebut;
  let heureFin = params.heureFin;
  if (params.creneauId) {
    const { data: creneau } = await supabaseAdmin
      .from("visites_creneaux")
      .select("date, heure_debut, heure_fin, formule_id")
      .eq("id", params.creneauId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!creneau) throw new VisiteError("Créneau introuvable.", 404);
    if (creneau.formule_id !== params.formuleId) throw new VisiteError("Ce créneau n'appartient pas à cette formule.", 400);
    date = creneau.date;
    heureDebut = creneau.heure_debut;
    heureFin = creneau.heure_fin;

    const { restante } = await getCapaciteRestante(params.creneauId);
    if (params.personnes > restante) {
      throw new VisiteError(`Capacité insuffisante sur ce créneau : ${restante} place(s) restante(s), ${params.personnes} demandée(s).`, 409);
    }
  }
  if (!date || !heureDebut) throw new VisiteError("Date et heure requises.", 400);
  if (!heureFin) heureFin = ajouterMinutes(heureDebut, formule.duree_minutes);

  const clientId = params.clientId ?? (await matcherClient(userId, params.visiteurEmail, params.visiteurTelephone));
  const statut = params.origine === "walk_in" ? "arrivee" : params.origine === "en_ligne" ? "en_attente" : "confirmee";

  const { data: reservation, error } = await supabaseAdmin
    .from("visites_reservations")
    .insert({
      user_id: userId,
      formule_id: params.formuleId,
      creneau_id: params.creneauId ?? null,
      date,
      heure_debut: heureDebut,
      heure_fin: heureFin,
      personnes: params.personnes,
      visiteur_nom: params.visiteurNom.trim(),
      visiteur_email: params.visiteurEmail?.trim() || null,
      visiteur_telephone: params.visiteurTelephone?.trim() || null,
      langue: params.langue || "Français",
      client_id: clientId,
      statut,
      origine: params.origine,
      statut_paiement: "a_configurer",
      montant_du: calculerMontant(formule, params.personnes),
      checkin_le: params.origine === "walk_in" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();
  if (error) throw new VisiteError(error.message, 500);

  await emettreEvenementVisite(userId, params.origine === "en_ligne" ? "visites.demande" : "visites.reservation", reservation, false, {
    formule_id: formule.id,
    personnes: params.personnes,
  });

  if (params.origine === "en_ligne") {
    await envoyerDemandeRecue(userId, reservation, formule.nom);
    await notifierVigneronNouvelleDemande(userId, reservation, formule.nom);
  }

  return reservation;
}

export type ParametresNouvelleVisite = {
  formuleId: string;
  date: string;
  heureDebut: string;
  heureFin?: string;
  personnes: number;
  visiteurNom?: string;
  visiteurEmail?: string;
  visiteurTelephone?: string;
  clientId?: string;
};

// "Nouvelle visite" (V3) — le viticulteur programme lui-même une visite :
// confirmée immédiatement, aucune validation nécessaire (c'est lui qui
// l'a créée). Se rattache à une disponibilité existante (ponctuelle ou
// occurrence d'une règle récurrente) si la date/heure correspond
// exactement, sinon réservation autonome sans créneau — même logique
// que l'ancien "Nouveau visiteur" walk-in.
export async function creerNouvelleVisite(userId: string, params: ParametresNouvelleVisite) {
  if (!params.formuleId) throw new VisiteError("Formule requise.", 400);
  if (!params.date || !params.heureDebut) throw new VisiteError("Date et heure requises.", 400);
  if (!Number.isInteger(params.personnes) || params.personnes <= 0) throw new VisiteError("Nombre de personnes invalide.", 400);

  let nomVisiteur = params.visiteurNom?.trim() || "";
  if (!nomVisiteur && params.clientId) {
    const { data: client } = await supabaseAdmin.from("clients").select("nom").eq("id", params.clientId).eq("user_id", userId).maybeSingle();
    nomVisiteur = client?.nom ?? "";
  }
  if (!nomVisiteur) nomVisiteur = "Visite sans nom";

  const creneau = await resoudreCreneauPourReservation(userId, params.formuleId, params.date, params.heureDebut);

  return creerReservation(userId, {
    formuleId: params.formuleId,
    creneauId: creneau?.id,
    date: params.date,
    heureDebut: params.heureDebut,
    heureFin: params.heureFin,
    personnes: params.personnes,
    visiteurNom: nomVisiteur,
    visiteurEmail: params.visiteurEmail,
    visiteurTelephone: params.visiteurTelephone,
    clientId: params.clientId,
    origine: "manuel",
  });
}

export type ParametresCreneauPonctuel = { formuleId: string; date: string; heureDebut: string; heureFin: string; capaciteMax: number };

// "Mes disponibilités" — créneau ponctuel : ouvre une disponibilité pour
// UNE date précise, sans aucun nom rattaché (action strictement
// séparée de "Nouvelle visite", exigence explicite du brief).
export async function creerCreneauPonctuel(userId: string, params: ParametresCreneauPonctuel) {
  if (!params.formuleId) throw new VisiteError("Formule requise.", 400);
  if (!params.date || !params.heureDebut || !params.heureFin) throw new VisiteError("Date, heure de début et heure de fin requises.", 400);
  if (!Number.isInteger(params.capaciteMax) || params.capaciteMax <= 0) throw new VisiteError("Capacité invalide.", 400);

  const { data: formule } = await supabaseAdmin.from("visites_formules").select("id").eq("id", params.formuleId).eq("user_id", userId).maybeSingle();
  if (!formule) throw new VisiteError("Formule introuvable.", 404);

  const { data, error } = await supabaseAdmin
    .from("visites_creneaux")
    .insert({ user_id: userId, formule_id: params.formuleId, date: params.date, heure_debut: params.heureDebut, heure_fin: params.heureFin, capacite_max: params.capaciteMax })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new VisiteError("Un créneau existe déjà pour cette formule à cette date et heure.", 409);
    throw new VisiteError(error.message, 500);
  }
  return data;
}

export type ParametresDisponibilitesRecurrentes = { formuleIds: string[]; joursSemaine: number[]; heureDebut: string; heureFin: string; capaciteMax: number };

// "Mes disponibilités" — disponibilité récurrente (V4) : plusieurs jours
// et plusieurs formules à la fois sur une même plage large ("tous les
// lundis+mercredis 10h-18h, formules Basic+Premium"). Une ligne par
// (jour × formule) — même granularité que V3, mais créée en masse en un
// seul geste. Une formule dont la durée ne rentre nulle part dans la
// plage est silencieusement écartée (jamais d'erreur bloquante pour les
// autres) et remontée dans `ecartees` pour que l'écran puisse informer
// le viticulteur. Jamais matérialisée à l'avance (voir
// resoudreCreneauPourReservation et listerCreneauxDisponibles).
export async function creerDisponibilitesRecurrentes(userId: string, params: ParametresDisponibilitesRecurrentes) {
  if (!params.formuleIds?.length) throw new VisiteError("Au moins une formule requise.", 400);
  if (!params.joursSemaine?.length) throw new VisiteError("Au moins un jour requis.", 400);
  if (params.joursSemaine.some((j) => !Number.isInteger(j) || j < 1 || j > 7)) throw new VisiteError("Jour de la semaine invalide.", 400);
  if (!params.heureDebut || !params.heureFin) throw new VisiteError("Heures de début et fin requises.", 400);
  if (minutesDepuisMinuit(params.heureFin) <= minutesDepuisMinuit(params.heureDebut)) throw new VisiteError("L'heure de fin doit être après l'heure de début.", 400);
  if (!Number.isInteger(params.capaciteMax) || params.capaciteMax <= 0) throw new VisiteError("Capacité invalide.", 400);

  const { data: formules } = await supabaseAdmin.from("visites_formules").select("id, nom, duree_minutes").eq("user_id", userId).in("id", params.formuleIds);
  if (!formules || formules.length === 0) throw new VisiteError("Formule introuvable.", 404);

  const formulesValides = formules.filter((f) => genererHeuresDebutPossibles(params.heureDebut, params.heureFin, f.duree_minutes).length > 0);
  const ecartees = formules.filter((f) => !formulesValides.includes(f)).map((f) => ({ formuleId: f.id, formuleNom: f.nom, dureeMinutes: f.duree_minutes }));
  if (formulesValides.length === 0) {
    throw new VisiteError("Aucune formule sélectionnée ne tient dans cette plage horaire.", 400);
  }

  const lignes = params.joursSemaine.flatMap((jourSemaine) =>
    formulesValides.map((f) => ({
      user_id: userId,
      formule_id: f.id,
      jour_semaine: jourSemaine,
      heure_debut: params.heureDebut,
      heure_fin: params.heureFin,
      capacite_max: params.capaciteMax,
    }))
  );

  const { data: creees, error } = await supabaseAdmin.from("visites_disponibilites_recurrentes").insert(lignes).select("*, visites_formules(nom, duree_minutes)");
  if (error) throw new VisiteError(error.message, 500);

  return { creees: creees ?? [], ecartees };
}

export async function listerDisponibilitesRecurrentes(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("visites_disponibilites_recurrentes")
    .select("*, visites_formules(nom, duree_minutes)")
    .eq("user_id", userId)
    .order("jour_semaine", { ascending: true })
    .order("heure_debut", { ascending: true });
  if (error) throw new VisiteError(error.message, 500);
  return data ?? [];
}

export async function modifierDisponibiliteRecurrente(userId: string, id: string, actif: boolean) {
  const { data, error } = await supabaseAdmin.from("visites_disponibilites_recurrentes").update({ actif }).eq("id", id).eq("user_id", userId).select("*").single();
  if (error) throw new VisiteError(error.message, 500);
  return data;
}

// Suspend UNE occurrence précise d'une règle récurrente ("pas de visite
// le 25/08, absent") sans toucher à la règle — jamais de casse de la
// disponibilité générale pour une seule exception ponctuelle.
export async function ajouterExceptionDisponibilite(userId: string, disponibiliteId: string, date: string, motif?: string) {
  if (!date) throw new VisiteError("Date requise.", 400);
  const { data: regle } = await supabaseAdmin.from("visites_disponibilites_recurrentes").select("id").eq("id", disponibiliteId).eq("user_id", userId).maybeSingle();
  if (!regle) throw new VisiteError("Disponibilité récurrente introuvable.", 404);

  const { data, error } = await supabaseAdmin
    .from("visites_disponibilites_exceptions")
    .insert({ user_id: userId, disponibilite_id: disponibiliteId, date, motif: motif?.trim() || null })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new VisiteError("Une exception existe déjà pour cette date.", 409);
    throw new VisiteError(error.message, 500);
  }
  return data;
}

export async function listerExceptionsDisponibilite(userId: string, disponibiliteId: string) {
  const { data, error } = await supabaseAdmin
    .from("visites_disponibilites_exceptions")
    .select("*")
    .eq("user_id", userId)
    .eq("disponibilite_id", disponibiliteId)
    .order("date", { ascending: true });
  if (error) throw new VisiteError(error.message, 500);
  return data ?? [];
}

export async function supprimerExceptionDisponibilite(userId: string, id: string) {
  const { error } = await supabaseAdmin.from("visites_disponibilites_exceptions").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new VisiteError(error.message, 500);
}

export async function checkin(userId: string, reservationId: string) {
  const { data: reservation } = await supabaseAdmin.from("visites_reservations").select("*").eq("id", reservationId).eq("user_id", userId).maybeSingle();
  if (!reservation) throw new VisiteError("Réservation introuvable.", 404);
  if (reservation.annule) throw new VisiteError("Cette réservation est annulée.", 409);

  const { data: maj, error } = await supabaseAdmin
    .from("visites_reservations")
    .update({ statut: "arrivee", checkin_le: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", reservationId)
    .select("*")
    .single();
  if (error) throw new VisiteError(error.message, 500);

  await emettreEvenementVisite(userId, "visites.checkin", maj, false);
  return maj;
}

export async function terminerVisite(userId: string, reservationId: string, noteAnecdote?: string) {
  const { data: reservation } = await supabaseAdmin.from("visites_reservations").select("*").eq("id", reservationId).eq("user_id", userId).maybeSingle();
  if (!reservation) throw new VisiteError("Réservation introuvable.", 404);
  if (reservation.annule) throw new VisiteError("Cette réservation est annulée.", 409);

  const { data: maj, error } = await supabaseAdmin
    .from("visites_reservations")
    .update({ statut: "terminee", note_anecdote: noteAnecdote?.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", reservationId)
    .select("*")
    .single();
  if (error) throw new VisiteError(error.message, 500);

  // declenche_contenu : une anecdote laissée après visite est le signal
  // "content-worthy" du brief (exemple donné : "visite terminée avec
  // avis positif") — pas d'analyse de sentiment, juste la présence d'une
  // note, transparente et vérifiable.
  await emettreEvenementVisite(userId, "visites.terminee", maj, !!noteAnecdote?.trim());
  return maj;
}

export async function annulerReservation(userId: string, reservationId: string, motif: string) {
  if (!motif?.trim()) throw new VisiteError("Motif d'annulation requis.", 400);

  const { data: reservation } = await supabaseAdmin.from("visites_reservations").select("*").eq("id", reservationId).eq("user_id", userId).maybeSingle();
  if (!reservation) throw new VisiteError("Réservation introuvable.", 404);
  if (reservation.annule) throw new VisiteError("Cette réservation est déjà annulée.", 409);

  const { data: maj, error } = await supabaseAdmin
    .from("visites_reservations")
    .update({
      annule: true,
      annule_le: new Date().toISOString(),
      motif_annulation: motif.trim(),
      statut: "annulee",
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId)
    .select("*")
    .single();
  if (error) throw new VisiteError(error.message, 500);

  await emettreEvenementVisite(userId, "visites.annulation", maj, false, { motif: motif.trim() });
  return maj;
}

export async function marquerPaiementSurPlace(userId: string, reservationId: string, moyenPaiement: string) {
  const { data: maj, error } = await supabaseAdmin
    .from("visites_reservations")
    .update({ statut_paiement: "paye_sur_place", moyen_paiement: moyenPaiement, updated_at: new Date().toISOString() })
    .eq("id", reservationId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw new VisiteError(error.message, 500);
  return maj;
}

// --- Demandes en ligne (V3) ---

export async function listerDemandesEnAttente(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("visites_reservations")
    .select("*, visites_formules(nom, duree_minutes)")
    .eq("user_id", userId)
    .eq("statut", "en_attente")
    .order("date", { ascending: true })
    .order("heure_debut", { ascending: true });
  if (error) throw new VisiteError(error.message, 500);
  return data ?? [];
}

export async function validerDemande(userId: string, reservationId: string) {
  const { data: reservation } = await supabaseAdmin
    .from("visites_reservations")
    .select("*, visites_formules(nom, mode_tarification)")
    .eq("id", reservationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!reservation) throw new VisiteError("Demande introuvable.", 404);
  if (reservation.statut !== "en_attente") throw new VisiteError("Cette demande n'est plus en attente.", 409);

  const { data: maj, error } = await supabaseAdmin
    .from("visites_reservations")
    .update({ statut: "confirmee", updated_at: new Date().toISOString() })
    .eq("id", reservationId)
    .select("*")
    .single();
  if (error) throw new VisiteError(error.message, 500);

  const formuleAssociee = Array.isArray(reservation.visites_formules) ? reservation.visites_formules[0] : reservation.visites_formules;
  await emettreEvenementVisite(userId, "visites.demande_validee", maj, false);
  await envoyerVisiteConfirmee(userId, maj, formuleAssociee?.nom ?? "Formule", formuleAssociee?.mode_tarification === "gratuit");
  return maj;
}

export async function refuserDemande(userId: string, reservationId: string, motif: string) {
  if (!motif?.trim()) throw new VisiteError("Motif de refus requis.", 400);

  const { data: reservation } = await supabaseAdmin
    .from("visites_reservations")
    .select("*, visites_formules(nom)")
    .eq("id", reservationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!reservation) throw new VisiteError("Demande introuvable.", 404);
  if (reservation.statut !== "en_attente") throw new VisiteError("Cette demande n'est plus en attente.", 409);

  const { data: maj, error } = await supabaseAdmin
    .from("visites_reservations")
    .update({
      statut: "refusee",
      annule: true,
      annule_le: new Date().toISOString(),
      motif_annulation: motif.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId)
    .select("*")
    .single();
  if (error) throw new VisiteError(error.message, 500);

  await emettreEvenementVisite(userId, "visites.demande_refusee", maj, false, { motif: motif.trim() });
  await envoyerExcuseRefus(userId, maj, reservation.visites_formules?.nom ?? "Formule");
  return maj;
}

const SEUIL_RELANCE_HEURES = 24;

// Vérification opportuniste (pas de cron dans ce projet — même principe
// que signalerClientInactifSiNouveau du chantier Clients) : appelée
// depuis GET des demandes en ligne, envoie une relance unique par
// demande dépassant 24h sans réponse. Ne libère jamais le créneau
// automatiquement (exigence explicite du brief).
export async function verifierEtRelancerDemandes(userId: string): Promise<void> {
  const seuil = new Date(Date.now() - SEUIL_RELANCE_HEURES * 3600_000).toISOString();
  const { data: demandes } = await supabaseAdmin
    .from("visites_reservations")
    .select("*, visites_formules(nom)")
    .eq("user_id", userId)
    .eq("statut", "en_attente")
    .lt("created_at", seuil)
    .is("relance_envoyee_le", null);

  for (const demande of demandes ?? []) {
    await envoyerRelanceVigneron(userId, demande, demande.visites_formules?.nom ?? "Formule");
    await supabaseAdmin.from("visites_reservations").update({ relance_envoyee_le: new Date().toISOString() }).eq("id", demande.id);
    await emettreEvenementVisite(userId, "visites.demande_relance", demande, false);
  }
}
