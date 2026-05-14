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

  const subject = `Resetar tua senha do ${brand.name}`;
  const html = layout({
    brand,
    preheader: `Pediram pra resetar a senha do ${email}. Se foi você, clica abaixo.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:${p.textPrimary};line-height:1.3;">
        Bora trocar tua senha
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Pediram pra resetar a senha do <strong style="color:${p.textPrimary};">${email}</strong>. Se foi você, clica abaixo. Senão, ignora esse email — nada vai mudar.
      </p>
      ${ctaButton(brand, url, "Criar nova senha")}
      ${linkFallback(brand, url, "Se o botão não funcionar, copia e cola este link:")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;border-top:1px solid ${p.border};">
        <tr>
          <td style="padding:16px 0 0;">
            <p style="margin:0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
              O link expira em 1 hora.<br>
              Se não foi você, fica tranquilo — tua senha continua a mesma.
            </p>
          </td>
        </tr>
      </table>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nBora trocar tua senha\n\nPediram pra resetar a senha do ${email}.\n\nCria a nova senha aqui: ${url}\n\nO link expira em 1 hora. Se não foi você, ignora esse email.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
