import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { obtenirAccessTokenValide, envoyerEmailGmail, GmailNonConnecteError, GmailRevoqueError } from "@/lib/google";

// Envoie un email réel via le compte Gmail connecté (scope gmail.send).
// `to` explicite requis à chaque appel — jamais résolu depuis une liste
// còté serveur, pour qu'aucun envoi de masse ne parte sans un
// destinataire vérifié par l'appelant (voir studio/mail et
// studio/creation : "M'envoyer un test" cible toujours l'adresse Gmail
// connectée elle-même).
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = await request.json().catch(() => ({}));
  const to = typeof body.to === "string" ? body.to.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject : "";
  const corpsHtml = typeof body.corpsHtml === "string" ? body.corpsHtml : "";

  if (!to || !subject || !corpsHtml) {
    return NextResponse.json({ error: "Destinataire, objet et corps requis." }, { status: 400 });
  }

  try {
    const { accessToken, email } = await obtenirAccessTokenValide(user.id);
    await envoyerEmailGmail({ accessToken, from: email, to, subject, corpsHtml });
    return NextResponse.json({ ok: true, from: email });
  } catch (erreur) {
    if (erreur instanceof GmailNonConnecteError) {
      return NextResponse.json({ error: erreur.message, code: "not_connected" }, { status: 409 });
    }
    if (erreur instanceof GmailRevoqueError) {
      return NextResponse.json({ error: erreur.message, code: "revoked" }, { status: 409 });
    }
    console.error("Échec de l'envoi Gmail :", erreur);
    return NextResponse.json({ error: "L'envoi a échoué. Réessayez dans un instant." }, { status: 502 });
  }
}
