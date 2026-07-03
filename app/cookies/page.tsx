import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/landing/legal-page-shell";

export const metadata: Metadata = {
  title: "Politique cookies — Pupitre",
};

export default function CookiesPage() {
  return (
    <LegalPageShell title="Politique cookies" updated="1er juillet 2026">
      <LegalSection title="Qu'est-ce qu'un cookie ?">
        <p>
          Un cookie est un petit fichier texte déposé sur votre appareil
          lors de la visite d&apos;un site. Il permet de mémoriser des
          informations sur votre navigation pendant un temps limité.
        </p>
      </LegalSection>

      <LegalSection title="Les cookies que nous utilisons">
        <p>
          <span className="font-medium text-ink">Cookies essentiels</span> —
          nécessaires au fonctionnement du site (mémorisation de votre choix
          de consentement). Ils ne peuvent pas être désactivés.
        </p>
        <p>
          <span className="font-medium text-ink">Cookies de mesure d&apos;audience</span> —
          nous aident à comprendre comment le site est utilisé, de façon
          anonymisée, afin de l&apos;améliorer. Ils ne sont déposés
          qu&apos;après votre accord.
        </p>
      </LegalSection>

      <LegalSection title="Gérer vos préférences">
        <p>
          Lors de votre première visite, une bannière vous permet
          d&apos;accepter ou de refuser les cookies non essentiels. Vous
          pouvez à tout moment modifier votre choix en effaçant les
          cookies de votre navigateur, ce qui réaffichera la bannière.
        </p>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <p>
          Votre choix de consentement est conservé 6 mois. Passé ce délai,
          la bannière vous sera de nouveau présentée.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative à cette politique, écrivez-nous à{" "}
          <a href="mailto:contact@pupitre.fr" className="text-vine underline">
            contact@pupitre.fr
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
