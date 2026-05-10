import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_NAME = "CollabShoot";
const SITE_URL = "https://collabshoot.com";
const FROM_EMAIL = "CollabShoot <noreply@collabshoot.com>";
const YEAR = new Date().getFullYear();

function buildWelcomeEmail(name: string): string {
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
    Welcome to ${SITE_NAME}! Your creative journey starts now 🎉
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

                    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#1a1714;line-height:1.3;">
                      Welcome, ${name}! 🎉
                    </h1>

                    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4a4640;">
                      Great to have you here! <strong style="color:#1a1714;">${SITE_NAME}</strong> is a platform made by creatives, for creatives — a space where photographers and models connect to create together through TFP (Time for Print) collaborations.
                    </p>

                    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4a4640;">
                      We just launched and <strong style="color:#a67c3d;">we need your help</strong> to grow! 🚀 Every person who joins makes a difference. When you complete your profile, share with friends, or propose a session, you're helping the entire community thrive.
                    </p>

                    <!-- Tips section -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#faf8f5;border-radius:12px;border:1px solid #e8e2d8;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1a1714;">
                            Getting started:
                          </p>
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding:4px 0;font-size:14px;line-height:1.6;color:#4a4640;">
                                📸 &nbsp;Complete your portfolio with your best shots
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;font-size:14px;line-height:1.6;color:#4a4640;">
                                🔍 &nbsp;Explore and find creatives near you
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;font-size:14px;line-height:1.6;color:#4a4640;">
                                🤝 &nbsp;Send your first TFP session request
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;font-size:14px;line-height:1.6;color:#4a4640;">
                                📢 &nbsp;Share ${SITE_NAME} with photographer and model friends
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#4a4640;">
                      Together, let's build the biggest creative community out there. We're just getting started and your presence is already part of this story.
                    </p>

                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
                      <tr>
                        <td align="center" style="border-radius:12px;background-color:#a67c3d;">
                          <a href="${SITE_URL}/discover" target="_blank" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;background-color:#a67c3d;border-radius:12px;text-decoration:none;text-align:center;line-height:1.2;">
                            Start Exploring
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#9a9489;text-align:center;">
                      Have questions or suggestions? We'd love to hear from you!<br>
                      Use the feedback button inside the app.
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
  return `${SITE_NAME}
${"─".repeat(40)}

Welcome, ${name}! 🎉

Great to have you here! ${SITE_NAME} is a platform made by creatives, for creatives — a space where photographers and models connect to create together through TFP collaborations.

We just launched and we need your help to grow! Every person who joins makes a difference.

Getting started:
📸 Complete your portfolio with your best shots
🔍 Explore and find creatives near you
🤝 Send your first TFP session request
📢 Share ${SITE_NAME} with friends

Start now: ${SITE_URL}/discover

Together, let's build the biggest creative community out there.

© ${YEAR} ${SITE_NAME}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");

    // Authenticate request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name } = await req.json();
    const firstName = (name || "").split(" ")[0] || "Creative";

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [user.email!],
      subject: `Welcome to ${SITE_NAME}, ${firstName}! 🎉`,
      html: buildWelcomeEmail(firstName),
      text: plainTextVersion(firstName),
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        "List-Unsubscribe": `<mailto:unsubscribe@collabshoot.com?subject=unsubscribe>`,
      },
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Welcome email sent:", data?.id);
    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-welcome error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
