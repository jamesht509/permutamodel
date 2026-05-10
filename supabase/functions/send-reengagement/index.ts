import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6";

const SITE_NAME = "CollabShoot";
const SITE_URL = "https://collabshoot.com";
const FROM_EMAIL = "CollabShoot <noreply@collabshoot.com>";
const YEAR = new Date().getFullYear();
const DAILY_LIMIT = 180; // stay under 200 free tier
const INACTIVE_HOURS = 48;
const COOLDOWN_DAYS = 15;

function buildReengagementEmail(name: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${SITE_NAME}</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0;padding:0;width:100%!important;height:100%!important}
    @media only screen and (max-width:600px){
      .container{width:100%!important;max-width:100%!important}
      .content-padding{padding:24px 20px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;font-size:1px;color:#f4f1ec;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${name}, we miss you on ${SITE_NAME}! New opportunities are waiting.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ec;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="container" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Brand -->
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <span style="font-size:26px;font-weight:800;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
                <span style="color:#a67c3d;">Collab</span><span style="color:#1a1714;">Shoot</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e2d8;">
                <tr><td style="height:4px;background-color:#a67c3d;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td class="content-padding" style="padding:36px 32px 32px;">
                    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1714;line-height:1.3;">
                      Hey, ${name}! 👋
                    </h1>
                    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4a4640;">
                      It's been a while since we've seen you around. In the meantime, new photographers and models have joined, castings have been posted, and sessions are happening.
                    </p>
                    <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:#4a4640;">
                      Want to see what's new?
                    </p>

                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
                      <tr>
                        <td align="center" style="border-radius:12px;background-color:#a67c3d;">
                          <a href="${SITE_URL}/discover" target="_blank" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;background-color:#a67c3d;border-radius:12px;text-decoration:none;text-align:center;line-height:1.2;">
                            Explore Now
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#9a9489;">
                      If you no longer wish to receive these emails, you can update your preferences in ${SITE_NAME} settings.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:12px;line-height:1.5;color:#9a9489;">
                    <p style="margin:0 0 4px;">&copy; ${YEAR} ${SITE_NAME}. All rights reserved.</p>
                    <p style="margin:0;">
                      <a href="${SITE_URL}/terms" style="color:#a67c3d;text-decoration:none;">Terms</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${SITE_URL}/privacy" style="color:#a67c3d;text-decoration:none;">Privacy</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function plainTextVersion(name: string): string {
  return `${SITE_NAME}\n${"─".repeat(40)}\n\nHey, ${name}!\n\nIt's been a while since we've seen you around. New photographers and models have joined, castings have been posted, and sessions are happening.\n\nExplore now: ${SITE_URL}/discover\n\nIf you no longer wish to receive these emails, update your preferences in settings.\n\n© ${YEAR} ${SITE_NAME}`;
}

Deno.serve(async () => {
  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - INACTIVE_HOURS * 60 * 60 * 1000).toISOString();
    const cooldownThreshold = new Date(now.getTime() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Find users: inactive 48h+, not emailed in 15 days, not banned, not seed, completed onboarding
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, name, email, last_active, last_reengagement_email_at")
      .eq("is_banned", false)
      .eq("is_seed", false)
      .eq("onboarding_completed", true)
      .eq("is_active", true)
      .lt("last_active", inactiveThreshold)
      .or(`last_reengagement_email_at.is.null,last_reengagement_email_at.lt.${cooldownThreshold}`)
      .order("last_active", { ascending: true })
      .limit(DAILY_LIMIT);

    if (error) {
      console.error("Query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!users || users.length === 0) {
      console.log("No users to re-engage");
      return new Response(JSON.stringify({ sent: 0, message: "No inactive users found" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${users.length} users to re-engage`);

    const resend = new Resend(apiKey);
    let sentCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      try {
        const firstName = (user.name || "").split(" ")[0] || "Creative";

        const { error: sendError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: [user.email],
          subject: `${firstName}, we miss you! 📸`,
          html: buildReengagementEmail(firstName),
          text: plainTextVersion(firstName),
          headers: {
            "X-Entity-Ref-ID": crypto.randomUUID(),
            "List-Unsubscribe": `<mailto:unsubscribe@collabshoot.com?subject=unsubscribe>`,
          },
        });

        if (sendError) {
          errors.push(`${user.email}: ${sendError.message}`);
          continue;
        }

        // Mark as emailed
        await supabase
          .from("profiles")
          .update({ last_reengagement_email_at: now.toISOString() })
          .eq("id", user.id);

        sentCount++;

        // Small delay to avoid rate limiting (200ms between sends)
        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        errors.push(`${user.email}: ${e instanceof Error ? e.message : "Unknown"}`);
      }
    }

    console.log(`Re-engagement complete: ${sentCount} sent, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        sent: sentCount,
        errors: errors.length,
        errorDetails: errors.slice(0, 5),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-reengagement error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
