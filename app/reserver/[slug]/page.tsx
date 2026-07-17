"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarX, Check, Clock, Users, Wine } from "lucide-react";
import { GlassBackground } from "@/components/glass/glass-background";
import { GlassPanel } from "@/components/glass/glass-panel";
import { GlassEmptyState } from "@/components/glass/glass-empty-state";
import { visitesPublicApi, type FormulePublique, type CreneauPublic } from "@/lib/visites-public-api";
import { formatDateLongue } from "@/lib/date-fr";

type Etape = "formule" | "creneau" | "coordonnees" | "confirmation";

export default function ReserverPage() {
  const params = useParams<{ slug: string }>();
  const [chargement, setChargement] = useState(true);
  const [introuvable, setIntrouvable] = useState(false);
  const [nomDomaine, setNomDomaine] = useState<string | null>(null);
  const [formules, setFormules] = useState<FormulePublique[]>([]);

  const [etape, setEtape] = useState<Etape>("formule");
  const [formule, setFormule] = useState<FormulePublique | null>(null);
  const [creneaux, setCreneaux] = useState<CreneauPublic[]>([]);
  const [creneau, setCreneau] = useState<CreneauPublic | null>(null);
  const [personnes, setPersonnes] = useState(1);

  const [visiteurNom, setVisiteurNom] = useState("");
  const [visiteurEmail, setVisiteurEmail] = useState("");
  const [visiteurTelephone, setVisiteurTelephone] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [reservationConfirmee, setReservationConfirmee] = useState<{ date: string; heureDebut: string; heureFin: string } | null>(null);

  useEffect(() => {
    visitesPublicApi
      .listerFormules(params.slug)
      .then((r) => {
        setFormules(r.formules);
        setNomDomaine(r.nomDomaine);
      })
      .catch(() => setIntrouvable(true))
      .finally(() => setChargement(false));
  }, [params.slug]);

  async function choisirFormule(f: FormulePublique) {
    setFormule(f);
    setPersonnes(1);
    setErreur(null);
    const { creneaux } = await visitesPublicApi.listerCreneaux(params.slug, f.id);
    setCreneaux(creneaux);
    setEtape("creneau");
  }

  function choisirCreneau(c: CreneauPublic) {
    setCreneau(c);
    setPersonnes(Math.min(personnes, c.restante));
    setEtape("coordonnees");
  }

  async function soumettreReservation(e: React.FormEvent) {
    e.preventDefault();
    if (!formule || !creneau) return;
    if (!visiteurNom.trim()) return setErreur("Nom requis.");
    if (!visiteurEmail.trim() && !visiteurTelephone.trim()) return setErreur("Email ou téléphone requis pour confirmer la réservation.");

    setEnvoi(true);
    setErreur(null);
    try {
      const { reservation } = await visitesPublicApi.reserver(params.slug, {
        formuleId: formule.id,
        date: creneau.date,
        heureDebut: creneau.heureDebut,
        personnes,
        visiteurNom: visiteurNom.trim(),
        visiteurEmail: visiteurEmail.trim() || undefined,
        visiteurTelephone: visiteurTelephone.trim() || undefined,
      });
      setReservationConfirmee({ date: reservation.date, heureDebut: reservation.heure_debut, heureFin: reservation.heure_fin });
      setEtape("confirmation");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "La réservation a échoué.");
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) return null;

  return (
    <div className="relative min-h-screen">
      <GlassBackground src="/images/glass/vignoble.jpg" alt="Vigne à contre-jour" />
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10">
        <GlassPanel intensity="strong" className="p-6">
          {introuvable ? (
            <GlassEmptyState icon={CalendarX} title="Page introuvable" description="Ce lien de réservation n'existe pas ou n'est plus actif." />
          ) : (
            <>
              <p className="mb-5 text-center text-sm font-medium tracking-wide text-white/70 uppercase">{nomDomaine ?? "Réserver une visite"}</p>

              {etape === "formule" && (
                <div className="flex flex-col gap-3">
                  {formules.length === 0 ? (
                    <GlassEmptyState icon={Wine} title="Aucune formule disponible" description="Revenez bientôt, les réservations ne sont pas encore ouvertes." />
                  ) : (
                    formules.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => choisirFormule(f)}
                        className="flex flex-col gap-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10"
                      >
                        <p className="font-medium text-white">{f.nom}</p>
                        {f.description && <p className="text-sm text-white/60">{f.description}</p>}
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" /> {f.duree_minutes} min
                          </span>
                          <span>{f.mode_tarification === "gratuit" ? "Gratuit" : f.mode_tarification === "total" ? `${f.prix_total} € / total` : `${f.prix_par_personne} € / pers.`}</span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3.5" /> {f.capacite_max} pers. max
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {etape === "creneau" && formule && (
                <div className="flex flex-col gap-3">
                  <button onClick={() => setEtape("formule")} className="self-start text-xs text-white/60 hover:text-white">
                    ← Changer de formule
                  </button>
                  <p className="text-sm text-white/70">{formule.nom} — choisissez un créneau</p>
                  {creneaux.length === 0 ? (
                    <GlassEmptyState icon={CalendarX} title="Aucun créneau disponible" description="Aucune date ouverte pour cette formule pour le moment." />
                  ) : (
                    <div className="flex flex-col gap-2">
                      {creneaux.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => choisirCreneau(c)}
                          className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-left transition-colors hover:bg-white/10"
                        >
                          <span className="text-sm text-white">
                            {formatDateLongue(c.date)} de {c.heureDebut} à {c.heureFin}
                          </span>
                          <span className="text-xs text-white/55">{c.restante} place{c.restante > 1 ? "s" : ""}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {etape === "coordonnees" && formule && creneau && (
                <form onSubmit={soumettreReservation} className="flex flex-col gap-3">
                  <button type="button" onClick={() => setEtape("creneau")} className="self-start text-xs text-white/60 hover:text-white">
                    ← Changer de créneau
                  </button>
                  <p className="text-sm text-white/70">
                    {formule.nom} — {formatDateLongue(creneau.date, { day: "numeric", month: "long" })} de {creneau.heureDebut} à {creneau.heureFin}
                  </p>

                  <div>
                    <label className="mb-1 block text-xs text-white/55">Nombre de personnes</label>
                    <input
                      type="number"
                      min={1}
                      max={creneau.restante}
                      value={personnes}
                      onChange={(e) => setPersonnes(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/55">Nom</label>
                    <input
                      value={visiteurNom}
                      onChange={(e) => setVisiteurNom(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-white/55">Email</label>
                      <input
                        type="email"
                        value={visiteurEmail}
                        onChange={(e) => setVisiteurEmail(e.target.value)}
                        className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-white/55">Téléphone</label>
                      <input
                        value={visiteurTelephone}
                        onChange={(e) => setVisiteurTelephone(e.target.value)}
                        className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none focus:border-white/30"
                      />
                    </div>
                  </div>

                  <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                    Le paiement en ligne n&apos;est pas encore disponible — le règlement se fera sur place.
                  </p>

                  {erreur && <p className="text-xs text-red-300">{erreur}</p>}

                  <button
                    type="submit"
                    disabled={envoi}
                    className="mt-1 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink hover:bg-gold/90 disabled:opacity-50"
                  >
                    {envoi ? "Réservation…" : "Confirmer la réservation"}
                  </button>
                </form>
              )}

              {etape === "confirmation" && reservationConfirmee && (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gold">
                    <Check className="size-6" />
                  </span>
                  <h3 className="text-xl font-semibold text-white">Demande envoyée</h3>
                  <p className="max-w-sm text-sm text-white/60">
                    Votre demande pour le {formatDateLongue(reservationConfirmee.date)} de {reservationConfirmee.heureDebut} à {reservationConfirmee.heureFin} a bien
                    été reçue et est en attente de confirmation par le domaine. {visiteurEmail ? "Un email vous a été envoyé, vous en recevrez un autre dès la validation." : ""}
                  </p>
                </div>
              )}
            </>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
