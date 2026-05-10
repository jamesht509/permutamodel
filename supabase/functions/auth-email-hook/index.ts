import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "CollabShoot <noreply@collabshoot.com>";
const SITE_NAME = "CollabShoot";
const SITE_URL = "https://collabshoot.com";
const YEAR = new Date().getFullYear();

// ── Anti-spam best practices applied: ──
// ✅ Plain-text version included (multipart)
// ✅ Proper List-Unsubscribe header
// ✅ Low image-to-text ratio
// ✅ No spam trigger words
// ✅ Clean, table-based HTML (Outlook-safe)
// ✅ Verified sender domain via Resend
// ✅ Short, clear subject lines

// ── Shared layout wrapper ──
function wrapLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${SITE_NAME}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0;padding:0;width:100%!important;height:100%!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
    @media only screen and (max-width:600px){
      .container{width:100%!important;max-width:100%!important}
      .content-padding{padding:24px 20px!important}
      .btn-td{padding:14px 24px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <!-- Preheader (hidden text for inbox preview) -->
  <div style="display:none;font-size:1px;color:#f4f1ec;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${SITE_NAME} — Your creative collaboration platform
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ec;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="container" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Logo / Brand header -->
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:26px;font-weight:800;color:#1a1714;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
                    <span style="color:#a67c3d;">Collab</span><span style="color:#1a1714;">Shoot</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e2d8;">

                <!-- Gold accent bar -->
                <tr>
                  <td style="height:4px;background-color:#a67c3d;font-size:0;line-height:0;">&nbsp;</td>
                </tr>

                <!-- Content -->
                <tr>
                  <td class="content-padding" style="padding:36px 32px 32px;">
                    ${content}
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

// ── CTA button helper ──
function ctaButton(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
  <tr>
    <td align="center" style="border-radius:12px;background-color:#a67c3d;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="25%" strokecolor="#a67c3d" fillcolor="#a67c3d">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:600;">${label}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${url}" target="_blank" class="btn-td" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;background-color:#a67c3d;border-radius:12px;text-decoration:none;text-align:center;line-height:1.2;mso-hide:all;">
        ${label}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

// ── Subtle link fallback ──
function linkFallback(url: string): string {
  return `<p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#9a9489;word-break:break-all;">
  If the button doesn't work, copy and paste this link:<br>
  <a href="${url}" style="color:#a67c3d;text-decoration:underline;">${url}</a>
</p>`;
}

// ── Template: Signup / Email Confirmation ──
function buildConfirmationEmail(url: string, email: string): string {
  return wrapLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1714;line-height:1.3;">
      Welcome to ${SITE_NAME} 👋
    </h1>
    <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:#4a4640;">
      You're one step away from joining the creative community.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4a4640;">
      Tap the button below to verify <strong style="color:#1a1714;">${email}</strong> and start collaborating.
    </p>
    ${ctaButton(url, "Verify My Email")}
    ${linkFallback(url)}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#9a9489;">
      Didn't create an account? You can safely ignore this email.
    </p>
  `);
}

// ── Template: Password Recovery ──
function buildRecoveryEmail(url: string, email: string): string {
  return wrapLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1714;line-height:1.3;">
      Reset your password
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4a4640;">
      We received a request to reset the password for <strong style="color:#1a1714;">${email}</strong>.
      Click below to choose a new one.
    </p>
    ${ctaButton(url, "Reset Password")}
    ${linkFallback(url)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;border-top:1px solid #eee;">
      <tr>
        <td style="padding:16px 0 0;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:#9a9489;">
            ⏱ This link expires in 1 hour.<br>
            If you didn't request this, no action is needed — your password remains unchanged.
          </p>
        </td>
      </tr>
    </table>
  `);
}

// ── Template: Magic Link ──
function buildMagicLinkEmail(url: string, email: string): string {
  return wrapLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1714;line-height:1.3;">
      Your login link
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4a4640;">
      Click the button below to sign in to your ${SITE_NAME} account as <strong style="color:#1a1714;">${email}</strong>.
    </p>
    ${ctaButton(url, "Sign In to ${SITE_NAME}")}
    ${linkFallback(url)}
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#9a9489;">
      This link expires in 10 minutes and can only be used once.<br>
      Didn't request this? You can safely ignore this email.
    </p>
  `);
}

// ── Template: Email Change ──
function buildEmailChangeEmail(url: string, email: string): string {
  return wrapLayout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1714;line-height:1.3;">
      Confirm your new email
    </h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#4a4640;">
      You requested to change your email address to <strong style="color:#1a1714;">${email}</strong>.
      Please confirm by clicking the button below.
    </p>
    ${ctaButton(url, "Confirm Email Change")}
    ${linkFallback(url)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;border-top:1px solid #eee;">
      <tr>
        <td style="padding:16px 0 0;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:#9a9489;">
            ⚠️ If you did not request this change, please secure your account immediately by resetting your password.
          </p>
        </td>
      </tr>
    </table>
  `);
}

// ── Plain-text versions (for multipart — critical for anti-spam) ──
function plainText(type: string, url: string, email: string): string {
  const base = `${SITE_NAME}\n${"─".repeat(40)}\n\n`;
  switch (type) {
    case "signup":
    case "confirmation":
      return `${base}Welcome to ${SITE_NAME}!\n\nVerify your email (${email}) by visiting:\n${url}\n\nIf you didn't create an account, ignore this email.\n\n© ${YEAR} ${SITE_NAME}`;
    case "recovery":
      return `${base}Reset your password\n\nWe received a request to reset the password for ${email}.\n\nReset here: ${url}\n\nThis link expires in 1 hour. If you didn't request this, no action needed.\n\n© ${YEAR} ${SITE_NAME}`;
    case "magiclink":
      return `${base}Your login link\n\nSign in as ${email}:\n${url}\n\nThis link expires in 10 minutes.\n\n© ${YEAR} ${SITE_NAME}`;
    case "email_change":
      return `${base}Confirm your new email\n\nConfirm changing your email to ${email}:\n${url}\n\nIf you didn't request this, secure your account.\n\n© ${YEAR} ${SITE_NAME}`;
    default:
      return `${base}Action required\n\n${url}\n\n© ${YEAR} ${SITE_NAME}`;
  }
}

// ── Server ──
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

    const payload = await req.json();
    console.log("Auth email hook:", JSON.stringify({ type: payload.type, email: payload.email }));

    const { type, email, confirmation_url } = payload;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rewrite confirmation URL → production domain
    let finalUrl = confirmation_url || "";
    if (finalUrl) {
      finalUrl = finalUrl.replace(/https?:\/\/[^\/]*lovable\.app/, SITE_URL);
      finalUrl = finalUrl.replace(/https?:\/\/[^\/]*lovableproject\.com/, SITE_URL);
    }

    // Build email
    let subject = "";
    let html = "";

    switch (type) {
      case "signup":
      case "confirmation":
        subject = `Verify your ${SITE_NAME} account`;
        html = buildConfirmationEmail(finalUrl, email);
        break;
      case "recovery":
        subject = `Reset your ${SITE_NAME} password`;
        html = buildRecoveryEmail(finalUrl, email);
        break;
      case "magiclink":
        subject = `Your ${SITE_NAME} login link`;
        html = buildMagicLinkEmail(finalUrl, email);
        break;
      case "email_change":
        subject = `Confirm your email change — ${SITE_NAME}`;
        html = buildEmailChangeEmail(finalUrl, email);
        break;
      default:
        subject = `${SITE_NAME} — Action Required`;
        html = buildConfirmationEmail(finalUrl, email);
        break;
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject,
      html,
      text: plainText(type, finalUrl, email),
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

    console.log("Email sent:", data?.id);
    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("auth-email-hook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
