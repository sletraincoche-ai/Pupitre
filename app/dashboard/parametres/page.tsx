"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings } from "lucide-react";
import { MetaConnectionCard } from "@/components/parametres/meta-connection-card";
import { LinkedinStubCard } from "@/components/parametres/linkedin-stub-card";
import { EmptyState } from "@/components/empty-state";
import { useMetaConnection } from "@/lib/meta-connection-context";
import { domaineProfile } from "@/lib/mock-data";

function dateDuJour() {
  return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function ConnexionsSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connecter } = useMetaConnection();
  const [connexionEnCours, setConnexionEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | undefined>(undefined);

  useEffect(() => {
    const simulate = searchParams.get("meta_simulate");
    const connected = searchParams.get("meta_connected");
    const erreurParam = searchParams.get("meta_error");

    if (simulate) {
      setConnexionEnCours(true);
      const delai = setTimeout(() => {
        connecter({
          demo: true,
          instagramUsername: domaineProfile.instagramHandle,
          instagramInitiales: domaineProfile.initiales,
          facebookPageName: domaineProfile.facebookHandle,
          dateConnexion: dateDuJour(),
        });
        setConnexionEnCours(false);
        router.replace("/dashboard/parametres");
      }, 1500);
      return () => clearTimeout(delai);
    }

    if (connected) {
      const igUsername = searchParams.get("ig_username") ?? "";
      connecter({
        demo: false,
        instagramUsername: igUsername,
        instagramInitiales: igUsername.slice(0, 2).toUpperCase() || "??",
        facebookPageName: searchParams.get("page_name") ?? "",
        dateConnexion: dateDuJour(),
      });
      router.replace("/dashboard/parametres");
      return;
    }

    if (erreurParam) {
      setErreur(erreurParam);
      router.replace("/dashboard/parametres");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <MetaConnectionCard erreur={erreur} connexionEnCours={connexionEnCours} />
      <LinkedinStubCard />
    </div>
  );
}

export default function ParametresPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl text-ink">Paramètres</h1>
        <p className="mt-1 text-stone">
          Profil du domaine, charte narrative et configuration des automatisations.
        </p>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg text-ink">Connexions</h2>
        <Suspense fallback={null}>
          <ConnexionsSection />
        </Suspense>
      </div>

      <div className="border-t border-border/60 pt-8">
        <EmptyState
          icon={Settings}
          title="Le reste des paramètres arrive bientôt"
          description="Profil du domaine, charte narrative, types de visites et gestion des utilisateurs seront réunis ici prochainement."
          actionLabel="Retour au tableau de bord"
          actionHref="/dashboard"
        />
      </div>
    </div>
  );
}
