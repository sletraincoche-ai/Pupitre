-- Comptes Studio IA — persistance réelle (remplace le mode simulation
-- localStorage). Accès exclusivement via les routes API Next.js avec la
-- clé service_role (jamais depuis le navigateur) : pas de RLS nécessaire
-- puisque aucune table n'est jamais interrogée directement par le client.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  identifiant text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_user_id_idx on sessions(user_id);

-- Réponses au test d'identité + charte narrative + historique
-- d'enrichissement (charte.piliers[]) — miroir du IdentiteStockee côté
-- client, un seul rang par compte.
create table if not exists identity_state (
  user_id uuid primary key references users(id) on delete cascade,
  consentement boolean not null default false,
  etape_courante int not null default 0,
  reponses jsonb not null default '{}'::jsonb,
  charte_proposee jsonb,
  charte jsonb,
  updated_at timestamptz not null default now()
);

-- Tunnel d'accueil "Bienvenu sur Studio AI" — un seul rang par compte,
-- absent = premier accès (tunnel_termine par défaut à false).
create table if not exists onboarding_state (
  user_id uuid primary key references users(id) on delete cascade,
  tunnel_termine boolean not null default false,
  etape_tunnel int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  storage_path text not null,
  legende text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists photos_user_id_idx on photos(user_id);

create table if not exists publications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plateforme text not null check (plateforme in ('Instagram', 'Facebook')),
  format text not null check (format in ('post', 'story', 'carrousel')),
  statut text not null default 'brouillon' check (statut in ('brouillon', 'programmee', 'publiee')),
  legende text not null default '',
  hashtags jsonb not null default '[]'::jsonb,
  musique text,
  photos jsonb not null default '[]'::jsonb,
  -- Date + heure choisies dans le calendrier de programmation — nul tant
  -- que le statut n'est pas "programmee".
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists publications_user_id_idx on publications(user_id);

-- Bucket de stockage pour les photos uploadées (privé — servi via URL
-- signée par les routes API, jamais d'accès public direct).
insert into storage.buckets (id, name, public)
values ('studio-photos', 'studio-photos', false)
on conflict (id) do nothing;

-- Connexion Gmail réelle (OAuth2, scope gmail.send uniquement) — un seul
-- rang par compte. refresh_token est la donnée sensible de longue durée ;
-- comme sessions.token, elle n'est lisible que par les routes API via la
-- clé service_role, jamais exposée au client.
create table if not exists gmail_connections (
  user_id uuid primary key references users(id) on delete cascade,
  google_email text not null,
  refresh_token text not null,
  access_token text,
  access_token_expires_at timestamptz,
  scope text not null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Connexion Meta réelle (OAuth2 Facebook Login, Facebook uniquement pour
-- ce chantier — Instagram non touché). user_access_token sert à relister
-- les Pages si l'utilisateur change de sélection ; page_access_token est
-- le jeton effectivement utilisé pour publier, propre à la Page choisie.
-- page_id/page_name/page_access_token restent nuls tant que
-- l'utilisateur n'a pas choisi sa Page (cas de comptes gérant plusieurs
-- Pages).
-- instagram_business_id/instagram_username : compte Instagram Business
-- lié à la Page choisie (résolu via le champ instagram_business_account,
-- ne nécessite aucun scope supplémentaire). instagram_publish_autorise :
-- vrai seulement si le token utilisateur a réellement accordé
-- instagram_content_publish (vérifié via /me/permissions après
-- connexion) — le lien Page↔compte Instagram peut exister sans que la
-- permission de publication ait été accordée, d'où le besoin d'une
-- reconnexion dédiée dans ce cas (voir lib/meta.ts).
create table if not exists meta_connections (
  user_id uuid primary key references users(id) on delete cascade,
  user_access_token text not null,
  facebook_user_id text not null,
  facebook_user_name text,
  page_id text,
  page_name text,
  page_access_token text,
  instagram_business_id text,
  instagram_username text,
  instagram_publish_autorise boolean not null default false,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Cave — registre de mouvements réel + export DRM au format DTI+
-- (remplace l'ancien Cave 100% simulé, lib/mock-data.ts Cuvee/Mouvement).
--
-- Structure et libellés alignés caractère pour caractère sur le schéma
-- officiel DGDDI : docs/dti-plus/ciel-dti-plus-viti_v1.0.14.xsd
-- (Documentation fonctionnelle DTI+ viticole v18, 09/03/2026,
-- douane.gouv.fr) — lu directement, pas deviné.
--
-- HYPOTHÈSE V1, à confirmer par l'utilisateur avant le premier vrai
-- dépôt CIEL (voir mémoire projet_pupitre_cave) : le domaine opère
-- exclusivement via capsules représentatives de droits (CRD)
-- personnalisées — régime standard des récoltants-manipulants en
-- Champagne (tirage → lattes → pointes → dégorgement → vente), donc
-- tout le cycle de vie du vin reste en `droits-suspendus`, le droit
-- étant sécurisé par la capsule posée au dégorgement plutôt que payé
-- traditionnellement. `droits-acquittes` n'est pas alimenté par le
-- registre de mouvements en V1 (RG7/RG8 : de toute façon incompatible
-- avec un agrément de type "A", acquittés-only) — le schéma le prévoit
-- (cave_mouvements.regime) pour ne pas bloquer une bascule ultérieure
-- si le domaine opère aussi en droits acquittés traditionnels.
-- ============================================================

-- Un produit déclaratif DTI+ par cuvée. libelle_personnalise est
-- l'identifiant permanent RG4 du XSD : une fois utilisé dans un export
-- généré, il ne doit plus jamais changer (vérifié côté appli, pas en
-- base — Postgres ne peut pas empêcher une UPDATE conditionnelle à
-- l'existence d'un export passé sans un trigger dédié, jugé excessif
-- pour la V1).
create table if not exists cave_produits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  nom text not null,
  millesime text,
  libelle_personnalise text not null,
  -- Exactement un des deux, jamais les deux (xsd:choice de ProduitType).
  libelle_fiscal text,
  code_inao text,
  -- tavType : décimal 2 décimales, 0.5 < tav < 100 (bornes exclusives).
  tav numeric(5,2),
  premix boolean not null default false,
  -- centilisationType — format bouteille par défaut de cette cuvée
  -- (CL_75 standard Champagne) ; une vente en magnum (CL_150) etc. peut
  -- surcharger via cave_mouvements.contenance.
  contenance_defaut text not null default 'CL_75',
  prix_vente_defaut numeric(10,2),
  -- RG16 : un produit omis d'une DRM doit avoir eu un stock-fin-periode
  -- à zéro dans la précédente — on ne le supprime jamais, on l'archive.
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  constraint cave_produits_libelle_fiscal_xor_code_inao check (
    (libelle_fiscal is not null) <> (code_inao is not null)
  ),
  constraint cave_produits_tav_bornes check (tav is null or (tav > 0.5 and tav < 100)),
  unique (user_id, libelle_personnalise)
);
create index if not exists cave_produits_user_id_idx on cave_produits(user_id);

-- Registre de mouvements horodatés — source de vérité unique pour le
-- stock temps réel ET pour le calcul des champs DTI+ (via
-- sous_categorie_dti, qui pointe le champ exact du XSD où ce mouvement
-- doit être compté). auteur + horodatage à la minute pour traçabilité
-- totale (exigence explicite du chantier).
create table if not exists cave_mouvements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  produit_id uuid not null references cave_produits(id) on delete restrict,
  type text not null check (type in (
    'tirage', 'degorgement', 'vente_comptoir', 'vente_client', 'export', 'perte', 'entree_acquitte'
  )),
  regime text not null check (regime in ('suspendu', 'acquitte')),
  quantite_bouteilles integer not null check (quantite_bouteilles > 0),
  contenance text not null default 'CL_75',
  -- Libellé libre affiché à l'utilisateur (ex: "Vente comptoir",
  -- "Salon") — distinct de sous_categorie_dti, qui est la case DTI+
  -- exacte où compter ce mouvement (ex: "ventes-france-crd-suspendus").
  origine text not null default '',
  -- Vente comptoir : jamais renseignés, principe fondateur (pas
  -- d'identité conservée). Vente client/export : renseignés.
  client_id uuid,
  client_nom text,
  prix_unitaire numeric(10,2),
  -- Objet réutilisable tel quel par une future Facturation (mêmes
  -- unités, même nommage) — évite une table de mapping fragile.
  montant numeric(12,2),
  -- Obligatoire côté appli (pas de contrainte SQL) quand
  -- sous_categorie_dti tombe dans une case "autres-*" (RG17-19/RG43-44
  -- du XSD imposent une observation dans ce cas).
  observations text,
  sous_categorie_dti text not null,
  auteur text not null,
  horodatage timestamptz not null default now(),
  created_at timestamptz not null default now(),
  -- Annulation tracée — jamais de suppression. Un mouvement annulé
  -- reste visible dans le registre (traçabilité totale) mais est exclu
  -- du calcul de stock et des balances DTI+ (voir lib/cave-server.ts,
  -- lib/cave-export.ts). Corriger une erreur de saisie = annuler ce
  -- mouvement puis en saisir un nouveau correct — jamais une réécriture
  -- en place des quantités/type d'un mouvement déjà enregistré.
  annule boolean not null default false,
  annule_le timestamptz,
  annule_par text,
  motif_annulation text
);
create index if not exists cave_mouvements_user_id_idx on cave_mouvements(user_id);
create index if not exists cave_mouvements_produit_id_idx on cave_mouvements(produit_id);

-- Migration additive : la table pouvait déjà exister avant l'ajout des
-- colonnes d'annulation ci-dessus (create table if not exists n'aurait
-- alors rien fait) — ALTER explicite pour couvrir ce cas.
alter table cave_mouvements add column if not exists annule boolean not null default false;
alter table cave_mouvements add column if not exists annule_le timestamptz;
alter table cave_mouvements add column if not exists annule_par text;
alter table cave_mouvements add column if not exists motif_annulation text;

-- Comptes CRD (capsules représentatives de droits) — un rang par
-- combinaison catégorie fiscale / type / centilisation (miroir de
-- compte-crd/centilisation dans le XSD, max 10 comptes par déclaration
-- côté DTI+, non forcé en base).
create table if not exists cave_capsules_comptes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  categorie_fiscale text not null default 'M' check (categorie_fiscale in ('M', 'T', 'PI', 'COGNAC-ARMAGNAC', 'ALCOOLS')),
  type_capsule text not null default 'PERSONNALISEES' check (type_capsule in (
    'PERSONNALISEES', 'COLLECTIVES_DROITS_SUSPENDUS', 'COLLECTIVES_DROITS_ACQUITTES'
  )),
  centilisation text not null default 'CL_75',
  -- Requis seulement si centilisation = 'AUTRE' (RG30 du XSD).
  volume_personnalise numeric(6,1),
  bib boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, categorie_fiscale, type_capsule, centilisation)
);

-- Mouvements de capsules — comptés en unités (nonNegativeInteger côté
-- XSD, pas en volume). mouvement_id relie une consommation de capsule
-- au mouvement bouteille qui l'a déclenchée (dégorgement), sans
-- dépendance stricte (on delete set null) pour ne pas bloquer une
-- correction de stock de capsules indépendante d'un mouvement précis.
create table if not exists cave_capsules_mouvements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  compte_id uuid not null references cave_capsules_comptes(id) on delete restrict,
  type text not null check (type in (
    'achat', 'retour', 'excedent', 'autre_entree', 'utilisation', 'destruction', 'manquant', 'autre_sortie'
  )),
  quantite integer not null check (quantite > 0),
  mouvement_id uuid references cave_mouvements(id) on delete set null,
  observations text,
  horodatage timestamptz not null default now(),
  -- Cascade d'annulation : quand le mouvement bouteille lié (dégorgement)
  -- est annulé, la consommation de capsule qu'il avait déclenchée l'est
  -- aussi — voir app/api/cave/mouvements/[id]/annuler/route.ts.
  annule boolean not null default false
);
create index if not exists cave_capsules_mouvements_compte_id_idx on cave_capsules_mouvements(compte_id);
alter table cave_capsules_mouvements add column if not exists annule boolean not null default false;

-- Une déclaration DRM par (compte, période). stocks_fin_periode fige un
-- instantané {produit_id: {suspendu, acquitte} en hL} au moment de la
-- génération — sert d'ancre à la règle de continuité RG9-12 du XSD
-- (stock-debut-periode du mois N+1 doit égaler stock-fin-periode du
-- mois N tel que déclaré, pas tel que recalculé rétroactivement si des
-- mouvements sont corrigés après coup).
create table if not exists cave_drm_declarations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  periode text not null,
  statut text not null default 'brouillon' check (statut in ('brouillon', 'genere', 'depose')),
  xml text,
  stocks_fin_periode jsonb not null default '{}'::jsonb,
  genere_le timestamptz,
  depose_le timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, periode)
);

-- Paramètres du domaine nécessaires à l'export DTI+ — numero_agrement
-- est le NumeroAcciseType du XSD (identification-redevable) : 13
-- caractères exacts, 2 lettres + 11 alphanumériques (ex: "FR012345E6789"
-- dans l'exemple officiel DGDDI). L'ancien mock ("51-00512-A") ne
-- respecte pas ce format — jamais utilisable tel quel pour un vrai
-- export, d'où une vraie table plutôt qu'une constante.
create table if not exists cave_parametres (
  user_id uuid primary key references users(id) on delete cascade,
  numero_agrement text,
  updated_at timestamptz not null default now(),
  constraint cave_parametres_numero_agrement_format check (
    numero_agrement is null or numero_agrement ~ '^[A-Za-z]{2}[0-9A-Za-z]{11}$'
  )
);

-- Table d'événements partagée — contrat de données central du
-- chantier : chaque mouvement de cave significatif (dégorgement, vente,
-- perte importante) y génère une ligne, qui alimentera Agenda.
-- déclenche_contenu est le crochet que Studio IA utilisera pour
-- proposer un post. Générique (pas "cave_evenements") car Facturation
-- et Agenda doivent pouvoir y écrire aussi, plus tard.
create table if not exists evenements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type_evenement text not null,
  date date not null,
  source text not null default 'cave' check (source in ('cave', 'facturation', 'agenda', 'studio')),
  payload jsonb not null default '{}'::jsonb,
  declenche_contenu boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists evenements_user_id_idx on evenements(user_id);
create index if not exists evenements_type_idx on evenements(type_evenement);
