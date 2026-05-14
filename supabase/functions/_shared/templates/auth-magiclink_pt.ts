import type { Brand } from "../brand.ts";
import { ctaButton, layout, linkFallback, paletteFor } from "./_layout.ts";

export interface AuthMagicLinkInput {
  brand: Brand;
  email: string;
  url: string;
}

export function buildMagicLinkPT(input: AuthMagicLinkInput): { subject: string; html: string; text: string } {
  const { brand, email, url } = input;
  const p = paletteFor(brand);

  const subject = `Teu link de login no ${brand.name}`;
  const html = layout({
    brand,
    preheader: `Clica pra entrar como ${email}.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:${p.textPrimary};line-height:1.3;">
        Teu link de login
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Clica no botão pra entrar no ${brand.name} como <strong style="color:${p.textPrimary};">${email}</strong>.
      </p>
      ${ctaButton(brand, url, "Entrar")}
      ${linkFallback(brand, url, "Se o botão não funcionar, copia e cola este link:")}
      <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
        O link expira em 10 minutos e só serve uma vez.<br>
        Não pediu isso? Ignora esse email.
      </p>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nTeu link de login\n\nEntra como ${email}:\n${url}\n\nO link expira em 10 minutos.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
