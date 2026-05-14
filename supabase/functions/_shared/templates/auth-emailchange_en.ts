import type { Brand } from "../brand.ts";
import { ctaButton, layout, linkFallback, paletteFor } from "./_layout.ts";

export interface AuthEmailChangeInput {
  brand: Brand;
  email: string;
  url: string;
}

export function build(input: AuthEmailChangeInput): { subject: string; html: string; text: string } {
  const { brand, email, url } = input;
  const p = paletteFor(brand);

  const subject = `Confirm your email change — ${brand.name}`;
  const html = layout({
    brand,
    preheader: `Confirm your new ${brand.name} email address.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${p.textPrimary};line-height:1.3;">
        Confirm your new email
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        You requested to change your ${brand.name} email address to <strong style="color:${p.textPrimary};">${email}</strong>.
        Confirm by clicking the button below.
      </p>
      ${ctaButton(brand, url, "Confirm email change")}
      ${linkFallback(brand, url, "If the button doesn't work, copy and paste this link:")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;border-top:1px solid ${p.border};">
        <tr>
          <td style="padding:16px 0 0;">
            <p style="margin:0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
              ⚠️ If you did not request this change, secure your account immediately by resetting your password.
            </p>
          </td>
        </tr>
      </table>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nConfirm your new email\n\nConfirm changing your email to ${email}:\n${url}\n\nIf you didn't request this, secure your account.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
