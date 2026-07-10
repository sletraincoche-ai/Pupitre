"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Check, Mail } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { GlassPanel } from "@/components/glass/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGmailConnection } from "@/lib/gmail-connection-context";

// Aucune vraie API Google branchée à ce stade (voir lib/gmail-connection-context.tsx)
// — connexion fictive au même titre que le mode démo Meta, mais suffisante
// pour bloquer réellement l'envoi tant qu'elle n'a pas eu lieu.
export function GmailConnexionGlass() {
  const { connecte, info, enConnexion, connecter, deconnecter } = useGmailConnection();
  const [adresse, setAdresse] = useState("");

  function soumettre(e: FormEvent) {
    e.preventDefault();
    if (!adresse.trim()) return;
    connecter(adresse.trim());
  }

  if (enConnexion) {
    return (
      <GlassPanel intensity="light" className="p-6">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Loader2 className="size-6 animate-spin text-gold" />
          <p className="font-medium text-white">Connexion en cours…</p>
        </div>
      </GlassPanel>
    );
  }

  if (connecte && info) {
    return (
      <GlassPanel intensity="light" className="flex flex-col gap-3 p-6">
        <span className="flex size-7 items-center justify-center rounded-lg bg-white">
          <SiGmail className="size-4 text-[#EA4335]" />
        </span>
        <div>
          <p className="text-base font-semibold text-white">Gmail</p>
          <p className="text-sm text-white/60">Connecté — envoi direct actif depuis le Studio</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/85">
          <Check className="size-4 text-gold" />
          {info.adresse}
        </div>
        <p className="text-xs text-white/50">Connecté le {info.dateConnexion}</p>
        <Button
          variant="outline"
          className="self-start border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={deconnecter}
        >
          Déconnecter
        </Button>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel intensity="light" className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <span className="flex size-7 items-center justify-center rounded-lg bg-white">
          <SiGmail className="size-4 text-[#EA4335]" />
        </span>
        <Badge variant="outline" className="border-white/20 text-white/70">
          Non connecté
        </Badge>
      </div>
      <div>
        <p className="text-base font-semibold text-white">Gmail</p>
        <p className="text-sm text-white/60">
          Connectez votre adresse Gmail pour envoyer vos campagnes directement depuis le Studio.
        </p>
      </div>
      <form onSubmit={soumettre} className="flex flex-wrap items-center gap-2">
        <Input
          type="email"
          required
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="vous@domaine.fr"
          className="h-9 max-w-[220px] border-white/20 bg-white/5 text-white placeholder:text-white/40"
        />
        <Button type="submit" className="bg-gold text-white hover:bg-gold/90">
          <Mail className="size-4" />
          Connecter Gmail
        </Button>
      </form>
    </GlassPanel>
  );
}
