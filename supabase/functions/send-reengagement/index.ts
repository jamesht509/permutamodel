// send-reengagement
//
// Cron-triggered re-engagement email. Service-role authenticated (the
// cron schedule passes the service role bearer). Finds users inactive
// 48h+, not banned/seed, not emailed in the last 15 days, and sends the
// reengagement template in their brand language. Throttled to 180/day
// to stay under the Brevo free tier.
//
// Brand routing per user via profile.country. profile.lang reserved
// for the future; currently NULL on all rows.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { brandFor } from "../_shared/brand.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";
import { buildReengagementPT } from "../_shared/templates/reengagement_pt.ts";
import { buildReengagementEN } from "../_shared/templates/reengagement_en.ts";

const DAILY_LIMIT = 180;
const INACTIVE_HOURS = 48;
const COOLDOWN_DAYS = 15;

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - INACTIVE_HOURS * 60 * 60 * 1000).toISOString();
    const cooldownThreshold = new Date(now.getTime() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, name, email, country, last_active, last_reengagement_email_at")
      .eq("is_banned", false)
      .eq("is_seed", false)
      .eq("onboarding_completed", true)
      .eq("is_active", true)
      .lt("last_active", inactiveThreshold)
      .or(`last_reengagement_email_at.is.null,last_reengagement_email_at.lt.${cooldownThreshold}`)
      .order("last_active", { ascending: true })
      .limit(DAILY_LIMIT);

    if (error) {
      console.error("send-reengagement query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!users || users.length === 0) {
      console.log("send-reengagement: no candidates");
      return new Response(JSON.stringify({ sent: 0, message: "No inactive users found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`send-reengagement: ${users.length} candidates`);

    let sentCount = 0;
    const errors: string[] = [];

    for (const u of users) {
      try {
        const firstName = (u.name || "").split(" ")[0] || (brandFor(u.country, null).key === "br" ? "Criativo" : "Creative");
        const brand = brandFor(u.country, null);
        const builder = brand.lang === "pt-BR" ? buildReengagementPT : buildReengagementEN;
        const { subject, html, text } = builder({ brand, firstName });

        await sendBrevoEmail({
          to: [{ email: u.email, name: u.name || undefined }],
          subject,
          htmlContent: html,
          textContent: text,
          sender: { email: brand.fromEmail, name: brand.fromName },
          tags: ["reengagement", brand.key],
          headers: {
            "X-Entity-Ref-ID": crypto.randomUUID(),
            "List-Unsubscribe": `<mailto:${brand.unsubscribeEmail}?subject=unsubscribe>`,
          },
        });

        await supabase
          .from("profiles")
          .update({ last_reengagement_email_at: now.toISOString() })
          .eq("id", u.id);

        sentCount++;

        // 200ms gap stays comfortably under Brevo's per-second cap.
        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        errors.push(`${u.email}: ${e instanceof Error ? e.message : "Unknown"}`);
      }
    }

    console.log(`send-reengagement done: ${sentCount} sent, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        sent: sentCount,
        errors: errors.length,
        errorDetails: errors.slice(0, 5),
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-reengagement error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
