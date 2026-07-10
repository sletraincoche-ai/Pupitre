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
