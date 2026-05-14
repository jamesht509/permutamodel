// auth-email-hook
//
// Invoked by Supabase Auth Hook when the platform needs to send a
// signup/recovery/magic-link/email-change email. Replaces the legacy
// Resend integration:
//   - delivery: Brevo (BREVO_API_KEY secret)
//   - copy: brand-routed via user_metadata.lang/country → BR default
//   - templates: 6 builders × 2 langs in ../_shared/templates/
//   - no more lovable.app URL rewrite (the Fase 1 cleanup removed the
//     hosts that needed it; production lives on permutamodel.com.br /
//     collabshoot.com)
//
// Runs without JWT verification (deploy with --no-verify-jwt or the MCP
// equivalent) — the request comes from Supabase Auth itself, not a user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { brandFor } from "../_shared/brand.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";
import { buildConfirmationPT } from "../_shared/templates/auth-confirmation_pt.ts";
import { buildConfirmationEN } from "../_shared/templates/auth-confirmation_en.ts";
import { buildRecoveryPT } from "../_shared/templates/auth-recovery_pt.ts";
import { buildRecoveryEN } from "../_shared/templates/auth-recovery_en.ts";
import { buildMagicLinkPT } from "../_shared/templates/auth-magiclink_pt.ts";
import { buildMagicLinkEN } from "../_shared/templates/auth-magiclink_en.ts";
import { buildEmailChangePT } from "../_shared/templates/auth-emailchange_pt.ts";
import { buildEmailChangeEN } from "../_shared/templates/auth-emailchange_en.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthHookPayload {
  user?: {
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data?: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
    site_url?: string;
  };
  // Legacy flat fields some self-hosted senders post:
  email?: string;
  confirmation_url?: string;
  type?: string;
}

function pickTemplate(action: string, lang: "en" | "pt-BR") {
  const isPt = lang === "pt-BR";
  switch (action) {
    case "signup":
    case "confirmation":
      return isPt ? buildConfirmationPT : buildConfirmationEN;
    case "recovery":
      return isPt ? buildRecoveryPT : buildRecoveryEN;
    case "magiclink":
    case "magic_link":
      return isPt ? buildMagicLinkPT : buildMagicLinkEN;
    case "email_change":
    case "email_change_new":
    case "email_change_current":
      return isPt ? buildEmailChangePT : buildEmailChangeEN;
    default:
      return isPt ? buildConfirmationPT : buildConfirmationEN;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as AuthHookPayload;

    // Supabase Auth Hook can post in two shapes (legacy flat + new nested).
    const email = payload.user?.email ?? payload.email;
    const action = payload.email_data?.email_action_type ?? payload.type ?? "confirmation";
    const url = payload.email_data?.redirect_to ?? payload.confirmation_url ?? "";
    const metadata = (payload.user?.user_metadata ?? {}) as Record<string, unknown>;
    const userLang = typeof metadata.lang === "string" ? (metadata.lang as string) : null;
    const userCountry = typeof metadata.country === "string" ? (metadata.country as string) : null;

    console.log("auth-email-hook:", JSON.stringify({ action, email, lang: userLang, country: userCountry }));

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Brand routing: explicit metadata wins, BR is the default (launch
    // target). If the user belongs to the legacy US base, their metadata
    // will say lang=en or country=US and we fall through to CollabShoot.
    const brand = brandFor(userCountry, userLang);
    const builder = pickTemplate(action, brand.lang);
    const { subject, html, text } = builder({ brand, email, url });

    const result = await sendBrevoEmail({
      to: [{ email }],
      subject,
      htmlContent: html,
      textContent: text,
      sender: { email: brand.fromEmail, name: brand.fromName },
      tags: ["auth", action],
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "List-Unsubscribe": `<mailto:${brand.unsubscribeEmail}?subject=unsubscribe>`,
      },
    });

    console.log("auth-email-hook sent:", result.messageId, "brand:", brand.key);
    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId, brand: brand.key }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("auth-email-hook error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
