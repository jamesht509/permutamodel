// Brevo REST API client for Deno edge functions.
// Docs: https://developers.brevo.com/reference/sendtransacemail
//
// No SDK needed — Brevo is a thin REST API. Keeping it here means the
// 4 email functions stay Deno-native and share one well-typed entry point.

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoEmailPayload {
  /** One or more recipients. */
  to: BrevoRecipient[];
  /** Subject line — keep under ~70 chars for inbox preview. */
  subject: string;
  /** Full HTML body (table-based, Outlook-safe). */
  htmlContent: string;
  /** Plain-text fallback. Required for spam-score health. */
  textContent: string;
  /**
   * Sender. Defaults to the BR brand sender; auth-email-hook and others
   * override via brand routing.
   */
  sender?: BrevoRecipient;
  replyTo?: BrevoRecipient;
  /** Tags surface in the Brevo dashboard (per-template analytics). */
  tags?: string[];
  /**
   * Extra headers. We always set List-Unsubscribe + X-Entity-Ref-ID at
   * the caller layer; passing more is allowed.
   */
  headers?: Record<string, string>;
}

export interface BrevoSendResult {
  messageId: string;
}

export class BrevoError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`Brevo API error ${status}: ${body}`);
    this.name = "BrevoError";
  }
}

const DEFAULT_SENDER: BrevoRecipient = {
  email: "noreply@permutamodel.com.br",
  name: "PermutaModel",
};

export async function sendBrevoEmail(payload: BrevoEmailPayload): Promise<BrevoSendResult> {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) throw new Error("BREVO_API_KEY is not configured");

  const sender = payload.sender ?? DEFAULT_SENDER;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender,
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      textContent: payload.textContent,
      replyTo: payload.replyTo,
      tags: payload.tags,
      headers: payload.headers,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new BrevoError(res.status, errorBody);
  }

  const json = await res.json();
  return { messageId: json.messageId };
}
