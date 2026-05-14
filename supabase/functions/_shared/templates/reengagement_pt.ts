import type { Brand } from "../brand.ts";
import { ctaButton, layout, paletteFor } from "./_layout.ts";

export interface ReengagementInput {
  brand: Brand;
  firstName: string;
}

export function build(input: ReengagementInput): { subject: string; html: string; text: string } {
  const { brand, firstName } = input;
  const p = paletteFor(brand);

  const subject = `${firstName}, sentimos tua falta!`;
  const html = layout({
    brand,
    preheader: `${firstName}, tem gente nova chegando perto de você no ${brand.name}.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:${p.textPrimary};line-height:1.3;">
        E aí, ${firstName}! 👋
      </h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Faz um tempinho que tu não cola por aqui. Enquanto isso, gente nova chegou, novos trampos pintaram e várias permutas rolaram.
      </p>
      <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:${p.textSecondary};">
        Bora dar uma olhada no que tá rolando?
      </p>

      ${ctaButton(brand, `${brand.url}/discover`, "Voltar pro " + brand.name)}

      <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${p.textTertiary};">
        Não quer mais receber? Atualiza tuas preferências nos ajustes do ${brand.name}.
      </p>
    `,
    extraFooter: `Não quer mais receber? <a href="mailto:${brand.unsubscribeEmail}?subject=descadastrar" style="color:${p.accent};text-decoration:none;">Atualizar preferências</a>`,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nE aí, ${firstName}!\n\nFaz um tempinho que tu não cola por aqui. Tem gente nova chegando perto de você.\n\nBora dar uma olhada: ${brand.url}/discover\n\nNão quer mais receber? Atualiza tuas preferências nos ajustes.\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
