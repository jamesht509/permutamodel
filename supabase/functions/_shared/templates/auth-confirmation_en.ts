import type { Brand } from "../brand.ts";
import { ctaButton, layout, linkFallback, paletteFor } from "./_layout.ts";

export interface AuthConfirmationInput {
  brand: Brand;
  email: string;
  url: string;
}

export function build(input: AuthConfirmationInput): { subject: string; html: string; text: string } {
  const { brand, email, url } = input;
  const p = paletteFor(brand);

  const subject = `Verify your ${brand.name} account`;
  const html = layout({
    brand,
    preheader: `Verify your ${brand.name} account to start collaborating.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${p.textPrimary};line-height:1.3;">
        Welcome to ${brand.name} 👋
      </h1>
      <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        You're one step away from joining the creative community.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Tap the button below to verify <strong style="color:${p.textPrimary};">${email}</strong> and start collaborating.
      </p>
      ${ctaButton(brand, url, "Verify my email")}
      ${linkFallback(brand, url, "If the button doesn't work, copy and paste this link:")}
      <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
        Didn't create an account? You can safely ignore this email.
      </p>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nWelcome to ${brand.name}!\n\nVerify your email (${email}) by visiting:\n${url}\n\nIf you didn't create an account, ignore this email.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
