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

// Capacité restante calculée à la volée depuis les réservations actives
// (annule = false, quel que soit le statut) — jamais un compteur stocké,
// pour ne jamais pouvoir se désynchroniser (RG anti-surbooking).
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

export type CreneauDisponible = {
  id: string;
  formule_id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  capaciteMax: number;
  restante: number;
};

// Créneaux à venir (aujourd'hui inclus) avec au moins une place —
// utilisé par la page publique de réservation. Pas de moteur de
// récurrence : le domaine ouvre ses créneaux explicitement.
export async function listerCreneauxDisponibles(userId: string, formuleId?: string): Promise<CreneauDisponible[]> {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  let requete = supabaseAdmin
    .from("visites_creneaux")
    .select("id, formule_id, date, heure_debut, heure_fin, capacite_max")
    .eq("user_id", userId)
    .gte("date", aujourdhui)
    .order("date", { ascending: true })
    .order("heure_debut", { ascending: true });
  if (formuleId) requete = requete.eq("formule_id", formuleId);

  const { data: creneaux, error } = await requete;
  if (error) throw new VisiteError(error.message, 500);
  if (!creneaux || creneaux.length === 0) return [];

  const { data: reservations } = await supabaseAdmin
    .from("visites_reservations")
    .select("creneau_id, personnes")
    .in(
      "creneau_id",
      creneaux.map((c) => c.id)
    )
    .eq("annule", false);

  const reserveesParCreneau = new Map<string, number>();
  for (const r of reservations ?? []) {
    if (!r.creneau_id) continue;
    reserveesParCreneau.set(r.creneau_id, (reserveesParCreneau.get(r.creneau_id) ?? 0) + r.personnes);
  }

  return creneaux
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
// pour les visites sans créneau explicite (walk-in), à partir de la
// durée déclarée de la formule.
function ajouterMinutes(heure: string, minutes: number): string {
  const [h, m] = heure.split(":").map(Number);
  const total = ((h * 60 + m + minutes) % (24 * 60) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
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

// Best-effort : une réservation ne doit jamais échouer parce que l'envoi
// d'email échoue (Gmail non connecté, token révoqué…) — voir
// lib/google.ts, déjà utilisé par Studio IA de la même façon.
async function envoyerConfirmation(
  userId: string,
  reservation: { visiteur_nom: string; visiteur_email: string | null; date: string; heure_debut: string; heure_fin: string },
  nomFormule: string
): Promise<void> {
  if (!reservation.visiteur_email) return;
  try {
    const { accessToken, email } = await obtenirAccessTokenValide(userId);
    await envoyerEmailGmail({
      accessToken,
      from: email,
      to: reservation.visiteur_email,
      subject: "Confirmation de votre visite",
      corpsHtml: `<p>Bonjour ${reservation.visiteur_nom},</p><p>Votre visite (${nomFormule}) est confirmée pour le ${reservation.date} de ${reservation.heure_debut} à ${reservation.heure_fin}.</p><p>Le paiement en ligne n'est pas encore disponible : le règlement se fera sur place.</p><p>À très bientôt !</p>`,
    });
  } catch (erreur) {
    if (erreur instanceof GmailNonConnecteError || erreur instanceof GmailRevoqueError) return;
    console.error("Échec de l'envoi de la confirmation de visite :", erreur);
  }
}

// Point d'entrée unique pour créer une réservation, en ligne, walk-in ou
// manuelle — mêmes vérifications de capacité, même matching client, même
// événement Agenda, quel que soit l'appelant.
// Vérification puis écriture (pas de verrou de ligne Postgres) — même
// niveau de rigueur que la vérification de stock Cave (RG13, voir
// lib/cave-server.ts) : suffisant pour le volume réel d'un domaine
// viticole, pas garanti contre deux réservations simultanées à la
// microseconde près sur le tout dernier créneau disponible.
export async function creerReservation(userId: string, params: ParametresReservation) {
  if (!params.formuleId) throw new VisiteError("Formule requise.", 400);
  if (!params.visiteurNom?.trim()) throw new VisiteError("Nom du visiteur requis.", 400);
  if (!Number.isInteger(params.personnes) || params.personnes <= 0) throw new VisiteError("Nombre de personnes invalide.", 400);
  if (params.origine === "en_ligne" && !params.visiteurEmail && !params.visiteurTelephone) {
    throw new VisiteError("Email ou téléphone requis pour une réservation en ligne.", 400);
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
      statut: params.origine === "walk_in" ? "arrivee" : "confirmee",
      origine: params.origine,
      statut_paiement: "a_configurer",
      montant_du: calculerMontant(formule, params.personnes),
      checkin_le: params.origine === "walk_in" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();
  if (error) throw new VisiteError(error.message, 500);

  await emettreEvenementVisite(userId, "visites.reservation", reservation, false, { formule_id: formule.id, personnes: params.personnes });
  if (params.origine === "en_ligne") await envoyerConfirmation(userId, reservation, formule.nom);

  return reservation;
}

export type ParametresAjouterVisite = {
  formuleId: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  personnes: number;
  visiteurNom?: string;
  visiteurEmail?: string;
  visiteurTelephone?: string;
  clientId?: string;
};

// Geste unique de l'onglet "Créneaux ouverts" (V2) : ouvrir un créneau
// ET, si un nom ou une fiche client est donné, y rattacher immédiatement
// une réservation pour ce même nombre de personnes — une réservation
// prise par téléphone ou un groupe déjà convenu, en une seule action. Si
// aucun nom n'est donné, seul le créneau est créé : il reste ouvert,
// disponible pour la page de réservation publique ("réservation libre").
export async function ajouterVisite(userId: string, params: ParametresAjouterVisite) {
  if (!params.formuleId) throw new VisiteError("Formule requise.", 400);
  if (!params.date || !params.heureDebut || !params.heureFin) throw new VisiteError("Date, heure de début et heure de fin requises.", 400);
  if (!Number.isInteger(params.personnes) || params.personnes <= 0) throw new VisiteError("Nombre de personnes invalide.", 400);

  const { data: formule } = await supabaseAdmin.from("visites_formules").select("id").eq("id", params.formuleId).eq("user_id", userId).maybeSingle();
  if (!formule) throw new VisiteError("Formule introuvable.", 404);

  const { data: creneau, error } = await supabaseAdmin
    .from("visites_creneaux")
    .insert({
      user_id: userId,
      formule_id: params.formuleId,
      date: params.date,
      heure_debut: params.heureDebut,
      heure_fin: params.heureFin,
      capacite_max: params.personnes,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new VisiteError("Un créneau existe déjà pour cette formule à cette date et heure.", 409);
    throw new VisiteError(error.message, 500);
  }

  let nomVisiteur = params.visiteurNom?.trim() || "";
  if (!nomVisiteur && params.clientId) {
    const { data: client } = await supabaseAdmin.from("clients").select("nom").eq("id", params.clientId).eq("user_id", userId).maybeSingle();
    nomVisiteur = client?.nom ?? "";
  }

  if (!nomVisiteur) {
    return { creneau, reservation: null };
  }

  const reservation = await creerReservation(userId, {
    formuleId: params.formuleId,
    creneauId: creneau.id,
    personnes: params.personnes,
    visiteurNom: nomVisiteur,
    visiteurEmail: params.visiteurEmail,
    visiteurTelephone: params.visiteurTelephone,
    clientId: params.clientId,
    origine: "manuel",
  });

  return { creneau, reservation };
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
