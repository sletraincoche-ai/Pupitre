import { NextRequest, NextResponse } from "next/server";
import { isMetaConfigured } from "@/lib/meta";

// Réception du retour OAuth Meta. N'est atteint que lorsque de vraies
// clés sont configurées (start() redirige vers le mode simulation sinon).
// Échange le code contre un token, vérifie la Page Facebook et son compte
// Instagram Business lié, puis relaie le résultat au client.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const erreurMeta = request.nextUrl.searchParams.get("error");

  if (erreurMeta || !code) {
    return NextResponse.redirect(`${origin}/dashboard/parametres?meta_error=oauth_denied`);
  }

  if (!isMetaConfigured()) {
    return NextResponse.redirect(`${origin}/dashboard/parametres?meta_simulate=1`);
  }

  try {
    const tokenParams = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: process.env.META_REDIRECT_URI!,
      code,
    });
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`
    );
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error("Échange de token échoué");
    }
    const accessToken: string = tokenData.access_token;

    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();
    const page = pagesData.data?.[0];
    if (!page) {
      return NextResponse.redirect(`${origin}/dashboard/parametres?meta_error=no_page`);
    }

    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account{username}&access_token=${accessToken}`
    );
    const igData = await igRes.json();
    const igAccount = igData.instagram_business_account;
    if (!igAccount) {
      return NextResponse.redirect(`${origin}/dashboard/parametres?meta_error=no_business_account`);
    }

    // MOCK : sans base de données, les infos du compte transitent par
    // l'URL pour que le client les enregistre. En production, stocker le
    // token côté serveur (session ou base de données) — jamais dans l'URL.
    const params = new URLSearchParams({
      meta_connected: "1",
      ig_username: igAccount.username ?? "",
      page_name: page.name ?? "",
    });
    return NextResponse.redirect(`${origin}/dashboard/parametres?${params.toString()}`);
  } catch {
    return NextResponse.redirect(`${origin}/dashboard/parametres?meta_error=unknown`);
  }
}
