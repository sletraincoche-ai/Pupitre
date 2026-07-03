import type { Metadata } from "next";
import { LegalPageShell, LegalSection } from "@/components/landing/legal-page-shell";

export const metadata: Metadata = {
  title: "Mentions légales — Pupitre",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageShell title="Mentions légales" updated="1er juillet 2026">
      <LegalSection title="Éditeur du site">
        <p>
          Le site pupitre.fr est édité par Pupitre SAS, société par actions
          simplifiée au capital de 10 000 €, immatriculée au Registre du
          Commerce et des Sociétés de Reims sous le numéro 900 000 000 00000,
          dont le siège social est situé 12 rue des Vignerons, 51200 Épernay,
          France.
        </p>
        <p>Directeur de la publication : Claire Dubosc, présidente.</p>
        <p>
          Contact :{" "}
          <a href="mailto:contact@pupitre.fr" className="text-vine underline">
            contact@pupitre.fr
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut,
          CA 91789, États-Unis.
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des contenus présents sur ce site (textes, visuels,
          logo, structure) est la propriété exclusive de Pupitre SAS, sauf
          mention contraire. Toute reproduction, même partielle, est
          interdite sans autorisation préalable.
        </p>
      </LegalSection>

      <LegalSection id="confidentialite" title="Politique de confidentialité">
        <p>
          Pupitre collecte les données transmises via le formulaire de
          demande d&apos;accès pilote (nom, nom de domaine viticole, adresse
          e-mail) dans le seul but de répondre à votre demande et de vous
          accompagner dans la mise en route du service. Ces données ne sont
          jamais cédées à des tiers à des fins commerciales.
        </p>
        <p>
          Conformément au Règlement Général sur la Protection des Données
          (RGPD), vous disposez d&apos;un droit d&apos;accès, de
          rectification, de portabilité et de suppression de vos données.
          Pour exercer ces droits, contactez{" "}
          <a href="mailto:contact@pupitre.fr" className="text-vine underline">
            contact@pupitre.fr
          </a>
          .
        </p>
        <p>
          Les données sont conservées pendant la durée de la relation
          commerciale, puis archivées conformément aux obligations légales.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative à ce site ou à vos données
          personnelles, écrivez-nous à{" "}
          <a href="mailto:contact@pupitre.fr" className="text-vine underline">
            contact@pupitre.fr
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
