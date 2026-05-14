// Shared email scaffolding used by every template (auth-*, welcome,
// reengagement). The BR layout uses Paleta B (dark editorial); the US
// legacy layout keeps the CollabShoot cream-and-gold look so we don't
// break the EN audience during the rollout.
//
// Returned strings are full <!DOCTYPE html> documents; templates only
// inject the inner content + a CTA url/label.

import type { Brand } from "../brand.ts";

export interface LayoutInput {
  brand: Brand;
  preheader: string;
  content: string;
  /** Optional secondary footer text rendered above the rights line. */
  extraFooter?: string;
}

const YEAR = new Date().getFullYear();

// ── Palette per brand. BR = Paleta B (dark); US = CollabShoot cream. ──
function palette(brand: Brand) {
  if (brand.key === "br") {
    return {
      pageBg: "#14101F",
      cardBg: "#1F1A2E",
      border: "#2D2640",
      textPrimary: "#F4F0FF",
      textSecondary: "#A8A2BD",
      textTertiary: "#6F6986",
      accent: brand.primaryColor,        // #FF6B4A
      accentText: "#1A0A05",
      footerLink: brand.primaryColor,
    };
  }
  return {
    pageBg: "#f4f1ec",
    cardBg: "#ffffff",
    border: "#e8e2d8",
    textPrimary: "#1a1714",
    textSecondary: "#4a4640",
    textTertiary: "#9a9489",
    accent: brand.primaryColor,          // #a67c3d
    accentText: "#ffffff",
    footerLink: brand.primaryColor,
  };
}

// ── Brand wordmark in the header. BR is lowercase "permutamodel". ──
function wordmark(brand: Brand, p: ReturnType<typeof palette>): string {
  if (brand.key === "br") {
    return `<span style="font-size:24px;font-weight:600;letter-spacing:-0.5px;color:${p.textPrimary};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <span style="color:${p.accent};">●</span> permutamodel
    </span>`;
  }
  return `<span style="font-size:26px;font-weight:800;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <span style="color:${p.accent};">Collab</span><span style="color:${p.textPrimary};">Shoot</span>
  </span>`;
}

function footerStrings(brand: Brand): { rights: string; terms: string; privacy: string; unsubscribe: string } {
  if (brand.key === "br") {
    return {
      rights: `© ${YEAR} ${brand.name}. Todos os direitos reservados.`,
      terms: "Termos",
      privacy: "Privacidade",
      unsubscribe: "Descadastrar",
    };
  }
  return {
    rights: `© ${YEAR} ${brand.name}. All rights reserved.`,
    terms: "Terms",
    privacy: "Privacy",
    unsubscribe: "Unsubscribe",
  };
}

export function layout(input: LayoutInput): string {
  const { brand, preheader, content, extraFooter } = input;
  const p = palette(brand);
  const f = footerStrings(brand);

  return `<!DOCTYPE html>
<html lang="${brand.lang}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${brand.name}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0;padding:0;width:100%!important;height:100%!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
    @media only screen and (max-width:600px){
      .container{width:100%!important;max-width:100%!important}
      .content-padding{padding:24px 20px!important}
      .btn-td{padding:14px 24px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${p.pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;font-size:1px;color:${p.pageBg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${p.pageBg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="container" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <tr>
            <td align="center" style="padding:0 0 24px;">
              ${wordmark(brand, p)}
            </td>
          </tr>

          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${p.cardBg};border-radius:16px;overflow:hidden;border:1px solid ${p.border};">
                <tr><td style="height:4px;background-color:${p.accent};font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td class="content-padding" style="padding:36px 32px 32px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 8px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:12px;line-height:1.5;color:${p.textTertiary};">
                    ${extraFooter ? `<p style="margin:0 0 8px;">${extraFooter}</p>` : ""}
                    <p style="margin:0 0 4px;">${f.rights}</p>
                    <p style="margin:0;">
                      <a href="${brand.url}/terms" style="color:${p.footerLink};text-decoration:none;">${f.terms}</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${brand.url}/privacy" style="color:${p.footerLink};text-decoration:none;">${f.privacy}</a>
                      &nbsp;&middot;&nbsp;
                      <a href="mailto:${brand.unsubscribeEmail}?subject=unsubscribe" style="color:${p.footerLink};text-decoration:none;">${f.unsubscribe}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── CTA button helper (VML fallback for Outlook). ──
export function ctaButton(brand: Brand, url: string, label: string): string {
  const p = palette(brand);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
  <tr>
    <td align="center" style="border-radius:12px;background-color:${p.accent};">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="25%" strokecolor="${p.accent}" fillcolor="${p.accent}">
        <w:anchorlock/>
        <center style="color:${p.accentText};font-family:sans-serif;font-size:15px;font-weight:600;">${label}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${url}" target="_blank" class="btn-td" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:${p.accentText};background-color:${p.accent};border-radius:12px;text-decoration:none;text-align:center;line-height:1.2;mso-hide:all;">
        ${label}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

export function linkFallback(brand: Brand, url: string, label: string): string {
  const p = palette(brand);
  return `<p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:${p.textTertiary};word-break:break-all;">
  ${label}<br>
  <a href="${url}" style="color:${p.accent};text-decoration:underline;">${url}</a>
</p>`;
}

export function paletteFor(brand: Brand) {
  return palette(brand);
}
