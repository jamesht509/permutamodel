import type { Brand } from "../brand.ts";
import { ctaButton, layout, paletteFor } from "./_layout.ts";

export interface WelcomeInput {
  brand: Brand;
  firstName: string;
}

export function buildWelcomePT(input: WelcomeInput): { subject: string; html: string; text: string } {
  const { brand, firstName } = input;
  const p = paletteFor(brand);

  const subject = `Salve, ${firstName}! Bem-vindo ao ${brand.name}`;
  const html = layout({
    brand,
    preheader: `Salve, ${firstName}! Bem-vindo ao ${brand.name}. Bora montar teu book.`,
    content: `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:${p.textPrimary};line-height:1.3;">
        Salve, ${firstName}! 🎉
      </h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${p.textSecondary};">
        Que bom que tu colou. O <strong style="color:${p.textPrimary};">${brand.name}</strong> é uma rede feita por criativos, pra criativos — onde fotógrafos e modelos se encontram pra fazer permuta (TFP).
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${p.textSecondary};">
        Estamos começando agora e <strong style="color:${p.accent};">teu papel importa</strong>. Cada perfil completo, cada permuta marcada, cada amigo que tu traz, ajuda a comunidade a crescer.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:${brand.key === "br" ? "#2A2440" : "#faf8f5"};border-radius:12px;border:1px solid ${p.border};">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:${p.textPrimary};">
              Próximos passos:
            </p>
            <p style="margin:4px 0;font-size:14px;line-height:1.6;color:${p.textSecondary};">📸 &nbsp;Cria teu book com tuas melhores fotos</p>
            <p style="margin:4px 0;font-size:14px;line-height:1.6;color:${p.textSecondary};">🔍 &nbsp;Acha gente perto de você</p>
            <p style="margin:4px 0;font-size:14px;line-height:1.6;color:${p.textSecondary};">🤝 &nbsp;Manda a primeira permuta</p>
            <p style="margin:4px 0;font-size:14px;line-height:1.6;color:${p.textSecondary};">📢 &nbsp;Chama os amigos pro ${brand.name}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:${p.textSecondary};">
        Juntos a gente constrói a maior comunidade criativa por aqui. A história tá só começando.
      </p>

      ${ctaButton(brand, `${brand.url}/discover`, "Bora começar")}

      <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:${p.textTertiary};text-align:center;">
        Tem dúvida ou ideia? Manda feedback pelo app, a gente lê tudo.
      </p>
    `,
  });

  const text = `${brand.name}\n${"─".repeat(40)}\n\nSalve, ${firstName}!\n\nQue bom que tu colou. O ${brand.name} é uma rede feita por criativos, pra criativos.\n\nPróximos passos:\n📸 Cria teu book\n🔍 Acha gente perto de você\n🤝 Manda a primeira permuta\n📢 Chama os amigos\n\nBora começar: ${brand.url}/discover\n\n© ${new Date().getFullYear()} ${brand.name}`;

  return { subject, html, text };
}
