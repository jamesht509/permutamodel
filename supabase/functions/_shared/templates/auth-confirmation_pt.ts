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

  const subject = `Confirma teu cadastro no ${brand.name}`;
  const html = layout({
    brand,
    preheader: `Cola aqui pra ativar tua conta no ${brand.name}.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:${p.textPrimary};line-height:1.3;">
        Salve! Cola aqui pra ativar tua conta
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Clica no botão abaixo pra confirmar <strong style="color:${p.textPrimary};">${email}</strong> e começar a usar o ${brand.name}.
      </p>
      ${ctaButton(brand, url, "Confirmar email")}
      ${linkFallback(brand, url, "Se o botão não funcionar, copia e cola este link:")}
      <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
        Não criou conta? Pode ignorar este email tranquilamente.
      </p>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nSalve! Confirma teu email (${email}) abrindo este link:\n${url}\n\nNão criou conta? Pode ignorar.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
