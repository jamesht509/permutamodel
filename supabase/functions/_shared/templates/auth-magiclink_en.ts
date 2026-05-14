import type { Brand } from "../brand.ts";
import { ctaButton, layout, linkFallback, paletteFor } from "./_layout.ts";

export interface AuthMagicLinkInput {
  brand: Brand;
  email: string;
  url: string;
}

export function buildMagicLinkEN(input: AuthMagicLinkInput): { subject: string; html: string; text: string } {
  const { brand, email, url } = input;
  const p = paletteFor(brand);

  const subject = `Your ${brand.name} login link`;
  const html = layout({
    brand,
    preheader: `Sign in to ${brand.name} as ${email}.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${p.textPrimary};line-height:1.3;">
        Your login link
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Click below to sign in to your ${brand.name} account as <strong style="color:${p.textPrimary};">${email}</strong>.
      </p>
      ${ctaButton(brand, url, `Sign in to ${brand.name}`)}
      ${linkFallback(brand, url, "If the button doesn't work, copy and paste this link:")}
      <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
        This link expires in 10 minutes and can only be used once.<br>
        Didn't request this? Safely ignore this email.
      </p>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nYour login link\n\nSign in as ${email}:\n${url}\n\nThis link expires in 10 minutes.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
