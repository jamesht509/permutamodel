import type { Brand } from "../brand.ts";
import { ctaButton, layout, paletteFor } from "./_layout.ts";

export interface WelcomeInput {
  brand: Brand;
  firstName: string;
}

export function build(input: WelcomeInput): { subject: string; html: string; text: string } {
  const { brand, firstName } = input;
  const p = paletteFor(brand);

  const subject = `Welcome to ${brand.name}, ${firstName}! 🎉`;
  const html = layout({
    brand,
    preheader: `Welcome to ${brand.name}! Your creative journey starts now.`,
    content: `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${p.textPrimary};line-height:1.3;">
        Welcome, ${firstName}! 🎉
      </h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${p.textSecondary};">
        Great to have you here. <strong style="color:${p.textPrimary};">${brand.name}</strong> is a platform made by creatives, for creatives — a space where photographers and models connect to create together through TFP (Time for Print) collaborations.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${p.textSecondary};">
        We just launched and <strong style="color:${p.accent};">we need your help</strong> to grow. Every person who joins makes a difference.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:${brand.key === "br" ? "#2A2440" : "#faf8f5"};border-radius:12px;border:1px solid ${p.border};">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${p.textPrimary};">
              Getting started:
            </p>
            <p style="margin:4px 0;font-size:14px;line-height:1.6;color:${p.textSecondary};">📸 &nbsp;Build your portfolio with your best shots</p>
            <p style="margin:4px 0;font-size:14px;line-height:1.6;color:${p.textSecondary};">🔍 &nbsp;Find creatives near you</p>
            <p style="margin:4px 0;font-size:14px;line-height:1.6;color:${p.textSecondary};">🤝 &nbsp;Send your first TFP request</p>
            <p style="margin:4px 0;font-size:14px;line-height:1.6;color:${p.textSecondary};">📢 &nbsp;Share ${brand.name} with friends</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:${p.textSecondary};">
        Together, let's build the biggest creative community out there. We're just getting started.
      </p>

      ${ctaButton(brand, `${brand.url}/discover`, "Start exploring")}

      <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:${p.textTertiary};text-align:center;">
        Questions or feedback? Use the feedback button inside the app.
      </p>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nWelcome, ${firstName}!\n\n${brand.name} is a platform made by creatives, for creatives.\n\nGetting started:\n📸 Build your portfolio\n🔍 Find creatives near you\n🤝 Send your first TFP request\n📢 Share with friends\n\nStart now: ${brand.url}/discover\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
