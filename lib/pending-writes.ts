// Compteur global des sauvegardes Studio en vol (identité, onboarding,
// photos, publications). La déconnexion attend qu'il retombe à zéro avant
// d'invalider la session — sans ça, une sauvegarde encore en réseau au
// moment du clic sur "Déconnexion" peut arriver après la suppression de
// la session côté serveur, échouer silencieusement (401 avalé par un
// .catch), et perdre la donnée qu'on croyait enregistrée.
let compteur = 0;
const enAttente = new Set<() => void>();

export function debuterEcriture() {
  compteur++;
}

export function terminerEcriture() {
  compteur = Math.max(0, compteur - 1);
  if (compteur === 0) {
    enAttente.forEach((resoudre) => resoudre());
    enAttente.clear();
  }
}

export function attendreEcrituresEnCours(timeoutMs = 4000): Promise<void> {
  if (compteur === 0) return Promise.resolve();
  return new Promise((resolve) => {
    const minuteur = setTimeout(() => {
      enAttente.delete(surResolu);
      resolve();
    }, timeoutMs);
    function surResolu() {
      clearTimeout(minuteur);
      resolve();
    }
    enAttente.add(surResolu);
  });
}
