import "server-only";
import { Resend } from "resend";
import {
  formatApaCitation,
  explorerTxUrl,
  ipfsGatewayUrls,
} from "@/lib/citation";
import { SITE_URL } from "@/lib/site";
import type { FeedbackType, OnChainCitation } from "@/lib/types";

/**
 * Transactional email via Resend, sent from the verified info.de-cite.com
 * subdomain. All sends are best-effort: a failure here must never break the
 * seal or feedback flow, so callers ignore the boolean result.
 */

const FROM = process.env.EMAIL_FROM ?? "DeCite <noreply@info.de-cite.com>";
// A monitored reply-to address improves trust/deliverability vs. a bare
// noreply@ sender. Set EMAIL_REPLY_TO to a mailbox you actually read; when
// unset, Resend simply omits the header.
const REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;
const SITE = SITE_URL || "https://de-cite.com";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// ─── Brand palette (inline — email clients ignore <style>/CSS vars) ──────────
const C = {
  ivory: "#fbfbf9",
  ink: "#0f172a",
  bronze: "#9a3412",
  seal: "#047857",
  sealSoft: "#ecfdf5",
  border: "#e2e8f0",
  muted: "#57534e",
  card: "#ffffff",
};

const SERIF =
  "Georgia, 'Times New Roman', Cambria, 'Source Serif 4', serif";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function shell(previewText: string, inner: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:${C.ivory};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ivory};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding:0 4px 20px;">
    <span style="font-family:${SERIF};font-size:22px;font-weight:600;color:${C.ink};letter-spacing:-0.01em;">DeCite</span>
    <span style="font-family:${SANS};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${C.muted};margin-left:8px;">Sealed Citations</span>
  </td></tr>
  <tr><td style="background:${C.card};border:1px solid ${C.border};border-top:3px solid ${C.bronze};border-radius:6px;padding:36px 32px;">
    ${inner}
  </td></tr>
  <tr><td style="padding:20px 4px 0;font-family:${SANS};font-size:12px;color:${C.muted};line-height:1.6;">
    Permanent · Time-stamped · Independently verifiable · <a href="${SITE}" style="color:${C.bronze};text-decoration:none;">de-cite.com</a><br>
    Your citation is saved to a permanent public record — readable forever, even without this site.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr>
    <td style="background:${C.ink};border-radius:4px;">
      <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${SANS};font-size:14px;font-weight:600;color:${C.ivory};text-decoration:none;">${label}</a>
    </td></tr></table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${C.muted};white-space:nowrap;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0 8px 16px;border-bottom:1px solid ${C.border};font-family:${SANS};font-size:14px;color:${C.ink};word-break:break-word;">${value}</td>
  </tr>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── 1 · Seal receipt ────────────────────────────────────────────────────────

export interface SealReceiptParams {
  to: string;
  code: string;
  sourceRef: string;
  authorName: string | null;
  platform: string | null;
  model: string | null;
  custodian: `0x${string}`;
  txHash: string;
  chainId: number;
  timestamp: number; // unix seconds
  ipfsCID: string;
}

export async function sendSealReceipt(p: SealReceiptParams): Promise<boolean> {
  const resend = getResend();
  if (!resend || !p.to) return false;

  const verifyUrl = `${SITE}/dogrulama/${p.code}`;
  const txUrl = explorerTxUrl(p.chainId, p.txHash);
  const ipfsUrl = ipfsGatewayUrls(p.ipfsCID)[0].url;
  const citation: OnChainCitation = {
    sourceRef: p.sourceRef,
    ipfsCID: p.ipfsCID,
    timestamp: BigInt(p.timestamp),
    author: p.custodian,
    isRegistered: true,
  };
  const apa = formatApaCitation({
    code: p.code,
    citation,
    authorName: p.authorName ?? undefined,
    baseUrl: SITE,
    platform: p.platform,
    model: p.model,
  });
  const sealed = new Date(p.timestamp * 1000).toUTCString();
  const aiLabel =
    p.platform && p.platform !== "Manual"
      ? esc(p.platform) + (p.model ? ` (${esc(p.model)})` : "")
      : "—";

  const inner = `
    <div style="font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.seal};">Sealed &amp; Verified</div>
    <h1 style="margin:10px 0 6px;font-family:${SERIF};font-size:26px;font-weight:600;color:${C.ink};line-height:1.2;">Your citation is permanently sealed</h1>
    <p style="margin:0 0 20px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted};">Your conversation with AI is now permanently saved and time-stamped. Here is everything you need to cite it.</p>

    <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:16px;color:${C.bronze};letter-spacing:0.02em;margin-bottom:18px;">${esc(p.code)}</div>

    <div style="font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${C.muted};margin-bottom:8px;">Ready-to-cite (APA 7)</div>
    <div style="background:${C.ivory};border:1px solid ${C.border};border-radius:4px;padding:16px;font-family:${SERIF};font-size:14px;font-style:italic;line-height:1.6;color:${C.ink};margin-bottom:22px;">${esc(apa)}</div>

    ${button("View verification page", verifyUrl)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      ${infoRow("Citation code", esc(p.code))}
      ${infoRow("Work", esc(p.sourceRef))}
      ${infoRow("AI / Model", aiLabel)}
      ${infoRow("Sealed", esc(sealed))}
      ${infoRow("Public record", `<a href="${txUrl}" style="color:${C.bronze};text-decoration:none;">View the public record &rarr;</a>`)}
      ${infoRow("Permanent archive", `<a href="${ipfsUrl}" style="color:${C.bronze};text-decoration:none;">Open the saved file &rarr;</a>`)}
    </table>

    <p style="margin:22px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted};">This record is permanent and independent: even if DeCite ever goes offline, your citation stays readable from two independent public archives.</p>
  `;

  const text = [
    "Your citation is permanently sealed.",
    "",
    `Citation code: ${p.code}`,
    `Work: ${p.sourceRef}`,
    "",
    "Cite it (APA):",
    apa,
    "",
    `Open the citation page: ${verifyUrl}`,
    `Public record: ${txUrl}`,
    `Saved file: ${ipfsUrl}`,
    "",
    "This record is permanent and stays reachable even if DeCite ever goes offline.",
    "— DeCite · de-cite.com",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: p.to,
      replyTo: REPLY_TO,
      subject: `Your citation is sealed — ${p.code}`,
      html: shell("Your DeCite citation is permanently sealed.", inner),
      text,
    });
    return !error;
  } catch {
    return false;
  }
}

// ─── 2 · Feedback acknowledgement (to the sender) ────────────────────────────

export async function sendFeedbackAck(to: string): Promise<boolean> {
  const resend = getResend();
  if (!resend || !to) return false;
  const inner = `
    <h1 style="margin:0 0 10px;font-family:${SERIF};font-size:24px;font-weight:600;color:${C.ink};">Thank you for your feedback</h1>
    <p style="margin:0 0 18px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted};">We received your message and genuinely read every one. It helps shape where DeCite goes next. If a reply is warranted, we'll be in touch.</p>
    ${button("Back to DeCite", SITE)}
  `;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: "We received your DeCite feedback",
      html: shell("Thanks for your feedback — we read everything.", inner),
      text: "Thank you for your feedback. We received your message and read every one. If a reply is warranted, we'll be in touch.\n\n— DeCite · de-cite.com",
    });
    return !error;
  } catch {
    return false;
  }
}

// ─── 3 · Feedback notification (to the operator) ─────────────────────────────

export async function sendFeedbackNotification(p: {
  type: FeedbackType;
  message: string;
  email: string | null;
}): Promise<boolean> {
  const resend = getResend();
  const to = process.env.FEEDBACK_NOTIFY_EMAIL;
  if (!resend || !to) return false;
  const inner = `
    <div style="font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.bronze};">New feedback · ${esc(p.type)}</div>
    <h1 style="margin:10px 0 16px;font-family:${SERIF};font-size:22px;font-weight:600;color:${C.ink};">Someone left feedback on DeCite</h1>
    <div style="background:${C.ivory};border:1px solid ${C.border};border-radius:4px;padding:16px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.ink};white-space:pre-wrap;">${esc(p.message)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
      ${infoRow("Type", esc(p.type))}
      ${infoRow("Reply-to", p.email ? esc(p.email) : "— (not provided)")}
    </table>
  `;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: p.email ?? undefined,
      subject: `DeCite feedback: ${p.type}`,
      html: shell(`New ${p.type} feedback on DeCite.`, inner),
      text: `New ${p.type} feedback on DeCite:\n\n${p.message}\n\nReply-to: ${p.email ?? "— (not provided)"}`,
    });
    return !error;
  } catch {
    return false;
  }
}
