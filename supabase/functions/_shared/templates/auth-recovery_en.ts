import type { Brand } from "../brand.ts";
import { ctaButton, layout, linkFallback, paletteFor } from "./_layout.ts";

export interface AuthRecoveryInput {
  brand: Brand;
  email: string;
  url: string;
}

export function build(input: AuthRecoveryInput): { subject: string; html: string; text: string } {
  const { brand, email, url } = input;
  const p = paletteFor(brand);

  const subject = `Reset your ${brand.name} password`;
  const html = layout({
    brand,
    preheader: `Reset your ${brand.name} password.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${p.textPrimary};line-height:1.3;">
        Reset your password
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        We received a request to reset the password for <strong style="color:${p.textPrimary};">${email}</strong>. Click below to choose a new one.
      </p>
      ${ctaButton(brand, url, "Reset password")}
      ${linkFallback(brand, url, "If the button doesn't work, copy and paste this link:")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;border-top:1px solid ${p.border};">
        <tr>
          <td style="padding:16px 0 0;">
            <p style="margin:0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
              ⏱ This link expires in 1 hour.<br>
              If you didn't request this, no action needed — your password is unchanged.
            </p>
          </td>
        </tr>
      </table>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nReset your password\n\nWe received a request to reset the password for ${email}.\n\nReset here: ${url}\n\nThis link expires in 1 hour. If you didn't request this, no action needed.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
