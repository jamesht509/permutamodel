import type { Brand } from "../brand.ts";
import { ctaButton, layout, paletteFor } from "./_layout.ts";

export interface ReengagementInput {
  brand: Brand;
  firstName: string;
}

export function buildReengagementEN(input: ReengagementInput): { subject: string; html: string; text: string } {
  const { brand, firstName } = input;
  const p = paletteFor(brand);

  const subject = `${firstName}, we miss you! 📸`;
  const html = layout({
    brand,
    preheader: `${firstName}, new opportunities are waiting on ${brand.name}.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${p.textPrimary};line-height:1.3;">
        Hey, ${firstName}! 👋
      </h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        It's been a while. In the meantime, new photographers and models have joined, castings have been posted, and sessions are happening.
      </p>
      <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Want to see what's new?
      </p>

      ${ctaButton(brand, `${brand.url}/discover`, "Explore now")}

      <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
        If you no longer wish to receive these emails, update your preferences in ${brand.name} settings.
      </p>
    `,
    extraFooter: `Don't want these emails? <a href="mailto:${brand.unsubscribeEmail}?subject=unsubscribe" style="color:${p.accent};text-decoration:none;">Update preferences</a>`,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nHey, ${firstName}!\n\nIt's been a while. New photographers and models have joined.\n\nExplore now: ${brand.url}/discover\n\nDon't want these? Update preferences in settings.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
