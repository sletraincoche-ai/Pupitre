import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="font-heading text-xl text-vine">PUPITRE</span>
          <p className="mt-2 max-w-xs text-sm text-stone">
            Le pilote des maisons de champagne indépendantes. Conçu en
            Champagne, pour les vignerons récoltants-manipulants.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-ink">Produit</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-stone">
              <li>
                <a href="#solution" className="hover:text-vine">Modules</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-vine">Tarifs</a>
              </li>
              <li>
                <a href="#demo" className="hover:text-vine">Démo</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Légal</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-stone">
              <li>
                <Link href="/mentions-legales" className="hover:text-vine">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales#confidentialite" className="hover:text-vine">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-vine">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Contact</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-stone">
              <li>
                <a href="mailto:contact@pupitre.fr" className="hover:text-vine">
                  contact@pupitre.fr
                </a>
              </li>
              <li>Épernay, Champagne</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-border/70 px-6 pt-6 text-xs text-stone">
        © 2026 Pupitre. Tous droits réservés.
      </div>
    </footer>
  );
}
