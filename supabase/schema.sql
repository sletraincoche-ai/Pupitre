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

-- Identité légale du domaine, nécessaire aux mentions obligatoires sur
-- facture (Code de commerce L441-9/L441-10, CGI art. 289) — mêmes
-- paramètres domaine que Cave, cave_parametres étendue plutôt qu'une
-- nouvelle table (l'énoncé du chantier Facturation le demande
-- explicitement : "le même enregistrement minimal créé pour Cave").
-- iban/bic : réservés pour le moyen de paiement affiché sur facture et
-- pour BT-84 (Factur-X). mention_penalites_retard est éditable mais
-- préremplie avec un texte conforme par défaut (taux légal supplétif
-- BCE+10pts, indemnité forfaitaire de 40€/facture, art. D441-5 Code de
-- commerce) au moment de la création du paramétrage côté API.
alter table cave_parametres add column if not exists raison_sociale text;
alter table cave_parametres add column if not exists forme_juridique text;
alter table cave_parametres add column if not exists capital_social numeric(12,2);
alter table cave_parametres add column if not exists siret text;
alter table cave_parametres add column if not exists tva_intracommunautaire text;
alter table cave_parametres add column if not exists rcs_ville text;
alter table cave_parametres add column if not exists adresse text;
alter table cave_parametres add column if not exists code_postal text;
alter table cave_parametres add column if not exists ville text;
alter table cave_parametres add column if not exists pays text not null default 'FR';
alter table cave_parametres add column if not exists iban text;
alter table cave_parametres add column if not exists bic text;
alter table cave_parametres add column if not exists mention_penalites_retard text;

-- ============================================================
-- Facturation — devis, bons de livraison, factures et avoirs nés
-- attachés au registre de Cave (jamais de saisie de vente séparée).
-- Recherche réglementaire menée directement (BOFiP, Légifrance,
-- economie.gouv.fr) le 13/07/2026 avant de coder — voir mémoire projet
-- pour le détail des sources.
-- ============================================================

-- Table clients minimale et RÉELLE (pas de mock) — la catégorie Clients
-- (CRM complet : tags, segments, origine...) reste un chantier séparé à
-- venir, qui ÉTENDRA cette même table plutôt que de la remplacer :
-- l'identifiant créé ici doit rester valide tel quel. profil détermine
-- la tarification par défaut (cave_produits.prix_particulier/
-- professionnel/chr) — voir plus bas.
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  nom text not null,
  profil text not null default 'particulier' check (profil in ('particulier', 'professionnel', 'chr')),
  email text,
  adresse text,
  code_postal text,
  ville text,
  pays text not null default 'FR',
  -- Requis en pratique pour professionnel/chr (facture B2B), mais pas
  -- contraint en base : un particulier peut exceptionnellement avoir un
  -- SIRET (micro-entrepreneur acheteur professionnel occasionnel).
  siret text,
  tva_intracommunautaire text,
  created_at timestamptz not null default now()
);
create index if not exists clients_user_id_idx on clients(user_id);

-- Extension pour le chantier Clients (2026-07-15), comme annoncé
-- ci-dessus au moment de la création de la table pendant Facturation —
-- ALTER explicite plutôt qu'ajout dans le create table, la table existe
-- déjà en prod. Pas de colonne "segment" : la segmentation est calculée
-- à la lecture depuis Cave/Facturation (règles simples et transparentes,
-- voir lib/clients-server.ts), jamais stockée ni resynchronisée pour
-- éviter qu'elle devienne fausse avec le temps. tags reste un champ
-- libre assigné par l'utilisateur (distinct de la segmentation
-- automatique).
alter table clients add column if not exists telephone text;
alter table clients add column if not exists notes text;
alter table clients add column if not exists tags jsonb not null default '[]'::jsonb;
alter table clients add column if not exists origine text;

-- Tarification multi-profil — colonnes ajoutées à cave_produits plutôt
-- qu'une table de prix parallèle (même principe que le reste du
-- chantier Cave) ; nulles = pas de tarif spécifique, retombe sur
-- prix_vente_defaut.
alter table cave_produits add column if not exists prix_particulier numeric(10,2);
alter table cave_produits add column if not exists prix_professionnel numeric(10,2);
alter table cave_produits add column if not exists prix_chr numeric(10,2);

-- Compteur de numérotation légale — une séquence CONTINUE et
-- INDÉPENDANTE par (utilisateur, type de document, année) : la loi
-- exige une suite chronologique sans trou par série, jamais un
-- compteur partagé entre plusieurs redevables (confirmé BOFiP
-- BOI-TVA-DECLA-30-20-20-10). La remise à zéro est autorisée en début
-- d'exercice, jamais en cours d'année. Incrémenté de façon atomique via
-- INSERT ... ON CONFLICT DO UPDATE ... RETURNING (voir
-- lib/facturation-numerotation.ts) pour éviter tout doublon en cas de
-- création concurrente.
create table if not exists facturation_sequences (
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('facture', 'avoir', 'devis', 'bon_livraison')),
  annee int not null,
  dernier_numero int not null default 0,
  primary key (user_id, type, annee)
);

-- Fonction serveur plutôt qu'un INSERT...ON CONFLICT exécuté depuis le
-- client PostgREST : une fonction garantit que l'incrémentation tient
-- dans une seule requête atomique (pas d'aller-retour réseau entre la
-- lecture et l'écriture), donc aucune race condition possible même en
-- cas de créations concurrentes de factures. Appelée via
-- supabaseAdmin.rpc(...) — voir lib/facturation-numerotation.ts.
create or replace function facturation_prochain_numero(p_user_id uuid, p_type text, p_annee int)
returns int
language sql
as $$
  insert into facturation_sequences (user_id, type, annee, dernier_numero)
  values (p_user_id, p_type, p_annee, 1)
  on conflict (user_id, type, annee)
  do update set dernier_numero = facturation_sequences.dernier_numero + 1
  returning dernier_numero;
$$;

-- Un même type de document couvre devis/BL/facture/avoir : structure
-- quasi identique (client, lignes, montants), et une transformation
-- (devis -> facture, BL -> facture) doit rester une simple création de
-- ligne référençant le document source, jamais une réécriture. numero
-- est NULL tant que le document est en brouillon (RG légale : le
-- numéro n'existe qu'à l'émission, jamais avant, jamais modifié après)
-- et devient définitif et immuable dès statut='emis' (appliqué côté
-- API, pas par une contrainte SQL — voir la route d'émission).
create table if not exists facturation_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('facture', 'avoir', 'devis', 'bon_livraison')),
  numero text,
  statut text not null default 'brouillon' check (statut in ('brouillon', 'emis', 'annule')),
  statut_paiement text check (statut_paiement in ('non_payee', 'partiellement_payee', 'payee')),

  client_id uuid references clients(id),
  -- Instantané des coordonnées client au moment de l'émission — une
  -- facture émise ne doit jamais changer même si la fiche client change
  -- ensuite (le client_id reste la référence stable pour la navigation,
  -- ce snapshot est ce qui est légalement opposable).
  client_nom_snapshot text,
  client_adresse_snapshot text,
  client_siret_snapshot text,
  client_tva_snapshot text,

  -- Devis transformé en facture, ou avoir référençant sa facture
  -- d'origine — jamais de duplication, juste une chaîne de références.
  document_source_id uuid references facturation_documents(id),

  date_emission date,
  date_echeance date,

  -- Champs Factur-X réservés dès maintenant (structure prête, XML non
  -- généré dans ce chantier — voir recherche réglementaire) :
  -- document_type_code = UNTDID 1001 (380 facture, 381 avoir),
  -- code_moyen_paiement = UNTDID 4461 (30 virement, 58 SEPA, 20 chèque,
  -- 10 espèces).
  document_type_code text,
  devise text not null default 'EUR',

  total_ht numeric(12,2) not null default 0,
  total_tva numeric(12,2) not null default 0,
  total_ttc numeric(12,2) not null default 0,

  mode_paiement text,
  code_moyen_paiement text,
  mention_penalites_retard text,

  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists facturation_documents_user_id_idx on facturation_documents(user_id);
create index if not exists facturation_documents_client_id_idx on facturation_documents(client_id);

-- Lignes de document. cave_mouvement_id est LE lien avec Cave — pas de
-- table parallèle : dès qu'une ligne représente une sortie de stock
-- réelle (facture ou BL émis), le mouvement est créé via la même API
-- que le reste de Cave (POST /api/cave/mouvements) et son id stocké
-- ici. unite en code UN/ECE Rec 20 (C62 = "unité", pertinent pour une
-- bouteille) — champ Factur-X réservé.
create table if not exists facturation_lignes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references facturation_documents(id) on delete cascade,
  designation text not null,
  quantite numeric(10,3) not null check (quantite > 0),
  unite text not null default 'C62',
  prix_unitaire_ht numeric(10,2) not null,
  taux_tva numeric(5,2) not null default 20.00,
  -- UNCL 5305 — S = taux standard, la quasi-totalité des lignes vin.
  code_categorie_tva text not null default 'S',
  montant_ht numeric(12,2) not null,

  cave_produit_id uuid references cave_produits(id),
  cave_mouvement_id uuid references cave_mouvements(id),

  ordre int not null default 0
);
create index if not exists facturation_lignes_document_id_idx on facturation_lignes(document_id);

-- ============================================================
-- Caisse conforme loi anti-fraude TVA (CGI art. 286 I 3° bis, principe
-- ISCA) pour la vente comptoir de Cave (cave_mouvements.type =
-- 'vente_comptoir'). Un ticket par mouvement (unique), jamais une
-- table de ventes séparée : c'est une couche d'intégrité fiscale
-- au-dessus du mouvement existant, pas un doublon de la vente
-- elle-même. Inaltérabilité + sécurisation = chaînage par empreinte
-- (hash de ce ticket = fonction du hash du ticket précédent), aucune
-- route d'UPDATE/DELETE n'est exposée pour cette table — voir
-- lib/caisse.ts.
-- ============================================================
create table if not exists caisse_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mouvement_id uuid not null unique references cave_mouvements(id),
  numero_ticket int not null,
  montant_ttc numeric(12,2) not null,
  hash text not null,
  hash_precedent text,
  horodatage timestamptz not null default now(),
  unique (user_id, numero_ticket)
);
create index if not exists caisse_tickets_user_id_idx on caisse_tickets(user_id);

-- create or replace ne peut pas changer le type d'un paramètre existant
-- (numeric -> numeric(12,2)) : DROP explicite sur l'ancienne signature
-- avant recréation, pour que ce fichier reste applicable de façon
-- idempotente même après ce changement de type.
drop function if exists caisse_creer_ticket(uuid, uuid, numeric);

-- Fonction serveur (pas de logique côté client) pour le chaînage —
-- SELECT ... FOR UPDATE verrouille la ligne du dernier ticket le temps
-- de la transaction, empêchant deux créations concurrentes de calculer
-- le même hash_precedent/numero_ticket. digest(...) vient de pgcrypto,
-- déjà activée en tête de ce fichier. Le contenu haché reprend tous les
-- champs qui doivent rester inaltérables (montant, horodatage, numéro,
-- hash précédent) : toute modification a posteriori d'un de ces champs
-- casserait la chaîne de manière détectable.
--
-- p_montant_ttc typé numeric(12,2) explicitement (pas juste "numeric") :
-- sans cette précision fixe, ::text peut produire "120" pour un appel
-- RPC JSON avec la valeur 120 alors que la colonne stockée
-- caisse_tickets.montant_ttc (numeric(12,2)) donnera toujours "120.00"
-- une fois relue — bug réel constaté à l'exécution le 13/07/2026 :
-- caisse_verifier_chaine signalait le premier ticket comme invalide à
-- cause de cette seule divergence de formatage, alors que rien n'avait
-- été altéré. Corrigé en forçant le même type des deux côtés.
create or replace function caisse_creer_ticket(p_user_id uuid, p_mouvement_id uuid, p_montant_ttc numeric(12,2))
returns table(numero_ticket int, hash text, hash_precedent text, horodatage timestamptz)
language plpgsql
as $$
declare
  v_dernier_numero int;
  v_dernier_hash text;
  v_horodatage timestamptz := now();
  v_hash text;
begin
  select ct.numero_ticket, ct.hash into v_dernier_numero, v_dernier_hash
  from caisse_tickets ct
  where ct.user_id = p_user_id
  order by ct.numero_ticket desc
  limit 1
  for update;

  v_dernier_numero := coalesce(v_dernier_numero, 0) + 1;
  -- CAST EXPLICITE requis ici, pas seulement le type déclaré du
  -- paramètre : Postgres n'applique PAS le typmod (12,2) sur les
  -- arguments de fonction (confirmé empiriquement le 13/07/2026,
  -- _probe(60::numeric(12,2)) renvoie "60", pas "60.00") — sans ce
  -- cast explicite ici, le hash ne correspond pas à ce que
  -- caisse_verifier_chaine recalcule en relisant la colonne
  -- montant_ttc (elle, une vraie colonne numeric(12,2), donne
  -- toujours "60.00").
  v_hash := encode(
    digest(
      coalesce(v_dernier_hash, '') || '|' || p_user_id::text || '|' || p_mouvement_id::text
        || '|' || (p_montant_ttc::numeric(12,2))::text || '|' || v_horodatage::text || '|' || v_dernier_numero::text,
      'sha256'
    ),
    'hex'
  );

  insert into caisse_tickets (user_id, mouvement_id, numero_ticket, montant_ttc, hash, hash_precedent, horodatage)
  values (p_user_id, p_mouvement_id, v_dernier_numero, p_montant_ttc, v_hash, v_dernier_hash, v_horodatage);

  return query select v_dernier_numero, v_hash, v_dernier_hash, v_horodatage;
end;
$$;

-- Vérification d'intégrité — recalcule chaque hash avec EXACTEMENT la
-- même construction de chaîne que caisse_creer_ticket ci-dessus (même
-- fonction SQL, donc mêmes conversions ::text, aucun risque de
-- divergence de formatage qu'une réimplémentation côté JS aurait pu
-- introduire) et la compare à ce qui est stocké. Utilisée par
-- lib/caisse.ts plutôt que de recalculer les hashs en JavaScript.
create or replace function caisse_verifier_chaine(p_user_id uuid)
returns table(valide boolean, premiere_anomalie int)
language plpgsql
as $$
declare
  v_ticket record;
  v_hash_attendu text := null;
  v_hash_recalcule text;
begin
  for v_ticket in
    select numero_ticket, mouvement_id, montant_ttc, hash, hash_precedent, horodatage
    from caisse_tickets
    where user_id = p_user_id
    order by numero_ticket asc
  loop
    if v_ticket.hash_precedent is distinct from v_hash_attendu then
      return query select false, v_ticket.numero_ticket;
      return;
    end if;

    v_hash_recalcule := encode(
      digest(
        coalesce(v_hash_attendu, '') || '|' || p_user_id::text || '|' || v_ticket.mouvement_id::text
          || '|' || v_ticket.montant_ttc::text || '|' || v_ticket.horodatage::text || '|' || v_ticket.numero_ticket::text,
        'sha256'
      ),
      'hex'
    );
    if v_hash_recalcule is distinct from v_ticket.hash then
      return query select false, v_ticket.numero_ticket;
      return;
    end if;

    v_hash_attendu := v_ticket.hash;
  end loop;

  return query select true, null::int;
end;
$$;

-- Clôtures journalière/mensuelle/annuelle cumulatives (exigence de
-- conservation ISCA) — periode est "AAAA-MM-JJ"/"AAAA-MM"/"AAAA" selon
-- le type. hash_cloture inclut le hash du dernier ticket de la période,
-- ce qui rend la clôture elle-même vérifiable contre la chaîne de
-- tickets.
create table if not exists caisse_clotures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('journaliere', 'mensuelle', 'annuelle')),
  periode text not null,
  total_ttc numeric(12,2) not null,
  nombre_tickets int not null,
  hash_cloture text not null,
  cree_le timestamptz not null default now(),
  unique (user_id, type, periode)
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
  source text not null default 'cave' check (source in ('cave', 'facturation', 'agenda', 'studio', 'clients')),
  payload jsonb not null default '{}'::jsonb,
  declenche_contenu boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists evenements_user_id_idx on evenements(user_id);
create index if not exists evenements_type_idx on evenements(type_evenement);

-- Clients (segmentation, grosse commande) puis Visites écrivent aussi
-- dans evenements — contrainte élargie après coup (posée trop tôt, avant
-- que ces chantiers existent). Définition finale unique plus bas
-- (evenements_source_check) : un premier élargissement intermédiaire
-- (sans 'visites') existait ici mais cassait le replay du schéma dès
-- qu'une vraie ligne source='visites' existait déjà — supprimé.

-- Chantier Visites — catalogue de formules, créneaux réels ouverts
-- explicitement par le domaine (pas de moteur de récurrence — la
-- "gestion avancée du planning" est hors périmètre), réservations en
-- ligne/walk-in/manuelles. Paiement en ligne Stripe non câblé pour
-- l'instant (aucune clé réelle disponible, décision explicite de
-- l'utilisateur : construire le reste, laisser le paiement en attente
-- réelle plutôt que de le simuler) : statut_paiement reste
-- 'a_configurer' tant que la config Stripe n'existe pas.
create table if not exists visites_formules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  nom text not null,
  description text,
  duree_minutes integer not null check (duree_minutes > 0),
  prix_par_personne numeric(10,2) not null check (prix_par_personne >= 0),
  -- V2 : mode de tarification explicite. 'par_personne' réutilise
  -- prix_par_personne (comportement V1 inchangé) ; 'total' ignore
  -- prix_par_personne au profit de prix_total (prix fixe du créneau,
  -- indépendant du nombre de participants) ; 'gratuit' ignore les deux.
  mode_tarification text not null default 'par_personne' check (mode_tarification in ('gratuit', 'total', 'par_personne')),
  prix_total numeric(10,2),
  capacite_max integer not null check (capacite_max > 0),
  archive boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists visites_formules_user_id_idx on visites_formules(user_id);

-- V3 : disponibilité récurrente ("tous les lundis 10h-12h") — jamais
-- matérialisée en avance pour chaque semaine future (calcul à la volée,
-- voir lib/visites-server.ts:resoudreCreneauPourReservation). Un vrai
-- visites_creneaux n'est créé qu'au moment où quelqu'un réserve
-- effectivement dessus — la règle elle-même reste la seule source de
-- vérité pour l'affichage de "Mes disponibilités" et pour la génération
-- des occurrences publiques futures. jour_semaine : 1=lundi..7=dimanche
-- (ISO 8601), pas la convention JS (0=dimanche).
create table if not exists visites_disponibilites_recurrentes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  formule_id uuid not null references visites_formules(id) on delete cascade,
  jour_semaine integer not null check (jour_semaine between 1 and 7),
  heure_debut text not null,
  heure_fin text not null,
  capacite_max integer not null check (capacite_max > 0),
  actif boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists visites_disponibilites_recurrentes_user_id_idx on visites_disponibilites_recurrentes(user_id);

-- Suspend une occurrence précise d'une règle récurrente ("pas de visite
-- le 25/08, absent") sans toucher à la règle elle-même.
create table if not exists visites_disponibilites_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  disponibilite_id uuid not null references visites_disponibilites_recurrentes(id) on delete cascade,
  date date not null,
  motif text,
  created_at timestamptz not null default now(),
  unique (disponibilite_id, date)
);
create index if not exists visites_disponibilites_exceptions_disponibilite_idx on visites_disponibilites_exceptions(disponibilite_id);

-- Capacité restante calculée à la volée depuis les réservations actives
-- (jamais stockée) — source de vérité unique, pas de compteur à
-- resynchroniser. heure_fin (V2) : l'accueil du jour affiche une plage
-- ("11h-12h"), pas juste une heure de début. disponibilite_id (V3) :
-- non nul si ce créneau a été matérialisé depuis une règle récurrente au
-- moment d'une réservation — distingue "créneau ponctuel" (nul) de
-- "occurrence d'une disponibilité récurrente" pour l'affichage de "Mes
-- disponibilités".
create table if not exists visites_creneaux (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  formule_id uuid not null references visites_formules(id) on delete cascade,
  disponibilite_id uuid references visites_disponibilites_recurrentes(id) on delete set null,
  date date not null,
  heure_debut text not null,
  heure_fin text not null,
  capacite_max integer not null check (capacite_max > 0),
  created_at timestamptz not null default now(),
  unique (formule_id, date, heure_debut)
);
create index if not exists visites_creneaux_user_id_idx on visites_creneaux(user_id);
create index if not exists visites_creneaux_date_idx on visites_creneaux(date);

create table if not exists visites_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  formule_id uuid not null references visites_formules(id) on delete restrict,
  creneau_id uuid references visites_creneaux(id) on delete set null,
  date date not null,
  heure_debut text not null,
  heure_fin text not null,
  personnes integer not null check (personnes > 0),
  visiteur_nom text not null,
  visiteur_email text,
  visiteur_telephone text,
  langue text not null default 'Français',
  -- Association facultative et automatique par email/téléphone, jamais
  -- bloquante, jamais de création forcée de fiche — même principe que la
  -- "vente sans identité" de Cave étendu aux visiteurs.
  client_id uuid references clients(id) on delete set null,
  -- V3 : une réservation en ligne naît 'en_attente' (jamais confirmée
  -- directement) — le créneau reste bloqué (compté dans la capacité,
  -- voir getCapaciteRestante qui exclut seulement annule=true) le temps
  -- que le viticulteur valide ou refuse. 'refusee' est distincte
  -- d'annulée : email et intention différents, même mécanique de
  -- libération (annule=true).
  statut text not null default 'confirmee' check (statut in ('confirmee', 'arrivee', 'terminee', 'annulee', 'en_attente', 'refusee')),
  origine text not null default 'walk_in' check (origine in ('en_ligne', 'walk_in', 'manuel')),
  statut_paiement text not null default 'a_configurer' check (statut_paiement in ('a_configurer', 'paye_sur_place', 'paye_ligne', 'rembourse')),
  moyen_paiement text,
  montant_du numeric(10,2),
  note_anecdote text,
  checkin_le timestamptz,
  annule boolean not null default false,
  annule_le timestamptz,
  motif_annulation text,
  -- Relance à 24h (V3) — évite les relances en double, jamais de
  -- libération automatique du créneau (exigence explicite du brief).
  relance_envoyee_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists visites_reservations_user_id_idx on visites_reservations(user_id);
create index if not exists visites_reservations_date_idx on visites_reservations(date);
create index if not exists visites_reservations_creneau_idx on visites_reservations(creneau_id);

-- Lien optionnel vers la visite à l'origine d'une vente Cave — pour
-- affichage seulement ("vente enregistrée" sur la carte réservation),
-- jamais une deuxième source de vérité du stock/DRM.
alter table cave_mouvements add column if not exists visite_id uuid references visites_reservations(id) on delete set null;

-- Slug public de réservation — réutilise cave_parametres (même principe
-- que l'extension faite pour Facturation : un seul enregistrement
-- minimal par domaine, pas de table dédiée pour un champ).
alter table cave_parametres add column if not exists slug_public text unique;

alter table evenements drop constraint if exists evenements_source_check;
alter table evenements add constraint evenements_source_check check (source in ('cave', 'facturation', 'agenda', 'studio', 'clients', 'visites'));

-- Chantier Visites V2 — migration des colonnes déjà en base (le create
-- table if not exists ci-dessus ne rejoue pas pour une table existante).
-- rename column n'est pas idempotent : gardé par un test d'existence
-- pour que ce fichier reste rejouable tel quel, comme le reste du schéma.
alter table visites_formules add column if not exists mode_tarification text not null default 'par_personne' check (mode_tarification in ('gratuit', 'total', 'par_personne'));
alter table visites_formules add column if not exists prix_total numeric(10,2);

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'visites_creneaux' and column_name = 'heure') then
    alter table visites_creneaux rename column heure to heure_debut;
  end if;
end $$;
alter table visites_creneaux add column if not exists heure_fin text;
-- Backfill : les créneaux déjà en base n'ont pas de fin connue,
-- approximée depuis la durée de la formule au moment de la migration
-- (jamais recalculée ensuite).
update visites_creneaux c
set heure_fin = to_char((c.heure_debut::time + (f.duree_minutes || ' minutes')::interval), 'HH24:MI')
from visites_formules f
where f.id = c.formule_id and c.heure_fin is null;
alter table visites_creneaux alter column heure_fin set not null;
alter table visites_creneaux drop constraint if exists visites_creneaux_formule_id_date_heure_key;
alter table visites_creneaux drop constraint if exists visites_creneaux_formule_id_date_heure_debut_key;
alter table visites_creneaux add constraint visites_creneaux_formule_id_date_heure_debut_key unique (formule_id, date, heure_debut);

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'visites_reservations' and column_name = 'heure') then
    alter table visites_reservations rename column heure to heure_debut;
  end if;
end $$;
alter table visites_reservations add column if not exists heure_fin text;
update visites_reservations r
set heure_fin = to_char((r.heure_debut::time + (f.duree_minutes || ' minutes')::interval), 'HH24:MI')
from visites_formules f
where f.id = r.formule_id and r.heure_fin is null;
alter table visites_reservations alter column heure_fin set not null;

-- Chantier Visites V3 — colonnes/tables déjà en base (le create table if
-- not exists ci-dessus ne rejoue pas pour une table existante).
alter table visites_creneaux add column if not exists disponibilite_id uuid references visites_disponibilites_recurrentes(id) on delete set null;
alter table visites_reservations add column if not exists relance_envoyee_le timestamptz;
alter table visites_reservations drop constraint if exists visites_reservations_statut_check;
alter table visites_reservations add constraint visites_reservations_statut_check check (statut in ('confirmee', 'arrivee', 'terminee', 'annulee', 'en_attente', 'refusee'));
