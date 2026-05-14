// send-welcome
//
// Fired by the client after onboarding completion (Onboarding.tsx
// supabase.functions.invoke("send-welcome", { body: { name } })).
// JWT-authenticated; the user's own JWT scopes the profile lookup.
//
// Brand routing:
//   1. profile.country (BR/US) — authoritative if set
//   2. profile.lang (future column; currently unused, kept forward-
//      compatible via spread)
//   3. user_metadata.lang/country fallback
//   4. brandFor() default → BR

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { brandFor } from "../_shared/brand.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";
import { buildWelcomePT } from "../_shared/templates/welcome_pt.ts";
import { buildWelcomeEN } from "../_shared/templates/welcome_en.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const overrideName = typeof body.name === "string" ? body.name : null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, country, email")
      .eq("id", user.id)
      .maybeSingle();

    const profileName = (overrideName ?? profile?.name ?? "") as string;
    const firstName = (profileName.split(" ")[0] || (brandFor(profile?.country, null).key === "br" ? "Criativo" : "Creative"));

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const userLang = typeof metadata.lang === "string" ? (metadata.lang as string) : null;
    const country = profile?.country ?? (typeof metadata.country === "string" ? (metadata.country as string) : null);

    const brand = brandFor(country, userLang);
    const builder = brand.lang === "pt-BR" ? buildWelcomePT : buildWelcomeEN;
    const { subject, html, text } = builder({ brand, firstName });

    const result = await sendBrevoEmail({
      to: [{ email: user.email!, name: profileName || undefined }],
      subject,
      htmlContent: html,
      textContent: text,
      sender: { email: brand.fromEmail, name: brand.fromName },
      tags: ["welcome", brand.key],
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "List-Unsubscribe": `<mailto:${brand.unsubscribeEmail}?subject=unsubscribe>`,
      },
    });

    console.log("send-welcome sent:", result.messageId, "brand:", brand.key);
    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId, brand: brand.key }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-welcome error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
