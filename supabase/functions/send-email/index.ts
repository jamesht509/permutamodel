// send-email
//
// Generic transactional send endpoint. Fase 5 LOCKED this function:
// previously it accepted any `to` field, which made it an open relay
// for any authenticated user (audit P1). Now `to` MUST equal the
// authenticated user's email — anything else returns 403.
//
// Brand routing via user_metadata.lang/country → brandFor() → BR default.
// Caller supplies subject + html + text directly; this function does not
// pick templates (auth/welcome/reengagement have their own endpoints).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { brandFor } from "../_shared/brand.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
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

    const { to, subject, html, text } = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── LOCK (audit P1) ──
    // The caller can only send to themselves. Reject any `to` that
    // doesn't match the authenticated user's email. Comparison is
    // case-insensitive because email addresses are.
    const targets = Array.isArray(to) ? to : [to];
    const normalizedSelf = user.email?.toLowerCase() ?? "";
    const allTargetsAreSelf = targets.every(
      (addr) => typeof addr === "string" && addr.toLowerCase() === normalizedSelf,
    );
    if (!normalizedSelf || !allTargetsAreSelf) {
      console.warn("send-email: refused cross-user send", { user: user.id, targets });
      return new Response(
        JSON.stringify({ error: "Forbidden: can only send to your own email address" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const userLang = typeof metadata.lang === "string" ? (metadata.lang as string) : null;
    const userCountry = typeof metadata.country === "string" ? (metadata.country as string) : null;
    const brand = brandFor(userCountry, userLang);

    const result = await sendBrevoEmail({
      to: targets.map((email) => ({ email })),
      subject,
      htmlContent: html ?? "",
      textContent: text ?? "",
      sender: { email: brand.fromEmail, name: brand.fromName },
      tags: ["transactional", brand.key],
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "List-Unsubscribe": `<mailto:${brand.unsubscribeEmail}?subject=unsubscribe>`,
      },
    });

    console.log("send-email sent:", result.messageId, "brand:", brand.key);
    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId, brand: brand.key }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-email error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
