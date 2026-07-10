"use client";

import { toast } from "sonner";

function versHtml(corps: string): string {
  return corps
    .split("\n")
    .map((ligne) => `<p>${ligne || "&nbsp;"}</p>`)
    .join("");
}

// "M'envoyer un test" — envoi réel via Gmail (scope gmail.send), toujours
// vers l'adresse du compte Gmail connecté lui-même. Jamais vers une
// adresse tierce : voir /api/studio/send-email pour le pourquoi.
export async function envoyerTestGmail(
  email: string,
  objet: string,
  corps: string,
  ouvrirConnexions: () => void
) {
  const res = await fetch("/api/studio/send-email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      to: email,
      subject: `[Test] ${objet || "(sans objet)"}`,
      corpsHtml: versHtml(corps),
    }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (data.code === "revoked" || data.code === "not_connected") {
      toast.error(data.error ?? "Connexion Gmail requise.");
      ouvrirConnexions();
      return;
    }
    toast.error(data.error ?? "L'envoi a échoué.");
    return;
  }

  toast.success(`Test envoyé à ${email}`);
}
