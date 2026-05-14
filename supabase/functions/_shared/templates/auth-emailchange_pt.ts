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

  const subject = `Confirma teu novo email`;
  const html = layout({
    brand,
    preheader: `Pediu pra mudar pro ${email}? Clica pra confirmar.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:${p.textPrimary};line-height:1.3;">
        Confirma a mudança de email
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Pediu pra mudar o email da tua conta no ${brand.name} pra <strong style="color:${p.textPrimary};">${email}</strong>?
        Clica pra confirmar.
      </p>
      ${ctaButton(brand, url, "Confirmar mudança")}
      ${linkFallback(brand, url, "Se o botão não funcionar, copia e cola este link:")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;border-top:1px solid ${p.border};">
        <tr>
          <td style="padding:16px 0 0;">
            <p style="margin:0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
              ⚠️ Não pediu isso? Vai em ajustes e troca a senha agora mesmo.
            </p>
          </td>
        </tr>
      </table>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nConfirma a mudança de email\n\nPediu pra mudar o email pra ${email}?\nConfirma aqui: ${url}\n\nSe não foi você, troca a senha imediatamente.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
