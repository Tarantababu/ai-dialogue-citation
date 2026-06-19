"use server";

import { PinataSDK } from "pinata-web3";
import { decode } from "turbo-stream";
import { cleanDialogueText } from "@/lib/dialogue-clean";
import {
  classifyShareUrl,
  SUPPORTED_PROVIDERS_LABEL,
} from "@/lib/share-providers";
import type {
  DialogueMessage,
  OriginInputType,
  PinResult,
  SealedPayload,
} from "@/lib/types";

/**
 * ────────────────────────────────────────────────────────────────────────
 *  PHASE 2 — Dual-input ingestion pipeline (Server Actions).
 *
 *  Option A · Share Link  → fetch public HTML, extract dialogue, pin JSON.
 *  Option B · Direct Paste → parse raw text/Markdown, pin JSON.
 *
 *  The PINATA_JWT is read ONLY here, on the server. It is never imported into
 *  a client component and never prefixed with NEXT_PUBLIC_, so it cannot leak
 *  into the browser bundle.
 * ────────────────────────────────────────────────────────────────────────
 */


const MAX_HTML_BYTES = 8 * 1024 * 1024; // 8 MB safety cap on fetched payloads
const MAX_MESSAGES = 2000;
const MAX_TEXT_CHARS = 1_500_000;
const FETCH_TIMEOUT_MS = 15_000;

/** Decode the small set of HTML entities that survive JSON extraction. */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

interface RankedMessage extends DialogueMessage {
  order: number;
}

/**
 * Deeply walk any parsed JSON tree looking for known message shapes.
 * Supports both ChatGPT (author.role + content.parts) and Claude
 * (sender + text / role + content) embedded payloads. Far more robust than
 * regex against minified, evolving share-page markup.
 */
/** Normalize a role/sender/type/from value to user | assistant | null. */
function mapRole(value: unknown): "user" | "assistant" | null {
  if (typeof value !== "string") return null;
  const s = value.toLowerCase();
  if (["user", "human", "you", "prompter", "questioner"].includes(s)) return "user";
  if (["assistant", "ai", "bot", "model", "gpt", "chatbot", "completion"].includes(s))
    return "assistant";
  return null;
}

/** Extract plain text from a string | block array | {parts}/{text}/{content}. */
function extractText(value: unknown, depth = 0): string {
  if (depth > 6) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((b) => {
        if (typeof b === "string") return b;
        if (b && typeof b === "object") {
          const o = b as Record<string, unknown>;
          if (typeof o.text === "string") return o.text;
          if (typeof o.content === "string") return o.content;
          if (typeof o.value === "string") return o.value;
        }
        return "";
      })
      .join("\n")
      .trim();
  }
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (Array.isArray(o.parts))
      return o.parts.filter((p): p is string => typeof p === "string").join("\n").trim();
    if (typeof o.text === "string") return o.text.trim();
    if (Array.isArray(o.content) || typeof o.content === "string")
      return extractText(o.content, depth + 1);
  }
  return "";
}

/**
 * Deeply walk any parsed JSON tree for known conversation message shapes —
 * generalized across ChatGPT, Claude, Gemini, Grok, Copilot, Perplexity,
 * DeepSeek, Poe and others: author.role+content, role/sender/type/from + text,
 * and question/answer pairs. Each node contributes at most one turn.
 */
function collectMessages(node: unknown, sink: RankedMessage[], depth = 0): void {
  if (depth > 40 || sink.length > MAX_MESSAGES) return;

  if (Array.isArray(node)) {
    for (const item of node) collectMessages(item, sink, depth + 1);
    return;
  }
  if (node === null || typeof node !== "object") return;

  const obj = node as Record<string, unknown>;
  const order =
    typeof obj.create_time === "number"
      ? obj.create_time
      : typeof obj.createTime === "number"
        ? obj.createTime
        : typeof obj.index === "number"
          ? obj.index
          : sink.length;

  let pushed = false;
  const push = (role: "user" | "assistant" | null, text: string, ord = order) => {
    if (!pushed && role && text) {
      sink.push({ role, text, order: ord });
      pushed = true;
    }
  };

  // 1 · author.role + content  (ChatGPT)
  const author = obj.author as Record<string, unknown> | undefined;
  if (author && typeof author.role === "string" && "content" in obj) {
    push(mapRole(author.role), extractText(obj.content));
  }
  // 2 · role + content/text/parts  (Claude, Gemini, OpenAI-style)
  if (!pushed && "role" in obj) {
    const body =
      "content" in obj ? obj.content : "text" in obj ? obj.text : obj.parts;
    push(mapRole(obj.role), extractText(body));
  }
  // 3 · sender + text/content/message  (Claude legacy, others)
  if (!pushed && "sender" in obj) {
    push(mapRole(obj.sender), extractText(obj.text ?? obj.content ?? obj.message));
  }
  // 4 · type + text/content/message
  if (!pushed && "type" in obj) {
    push(mapRole(obj.type), extractText(obj.text ?? obj.content ?? obj.message));
  }
  // 5 · from + text/content/message
  if (!pushed && "from" in obj) {
    push(mapRole(obj.from), extractText(obj.text ?? obj.content ?? obj.message));
  }
  // 6 · question/answer pair  (Perplexity-style)
  if (!pushed) {
    const q = obj.question ?? obj.query ?? obj.prompt;
    const a = obj.answer ?? obj.response ?? obj.completion;
    if (typeof q === "string" && q.trim() && typeof a === "string" && a.trim()) {
      sink.push({ role: "user", text: q.trim(), order });
      sink.push({ role: "assistant", text: a.trim(), order: order + 0.5 });
      pushed = true;
    }
  }

  for (const key of Object.keys(obj)) {
    collectMessages(obj[key], sink, depth + 1);
  }
}

/** Pull and JSON-parse every <script> blob in the document. */
function* iterateScriptJson(html: string): Generator<unknown> {
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw || raw.length < 2) continue;
    if (raw[0] !== "{" && raw[0] !== "[") continue;
    try {
      yield JSON.parse(decodeEntities(raw));
    } catch {
      // Not valid standalone JSON (e.g. assignment expression) — skip.
    }
  }
}

/**
 * Decode a React Router (turbo-stream) payload embedded in modern ChatGPT /
 * Claude share pages. The conversation is serialized into one or more
 * `streamController.enqueue("…")` chunks; we reassemble and decode them back
 * into the original object graph, then let collectMessages walk it.
 */
async function decodeReactRouterStream(html: string): Promise<unknown | null> {
  const re = /streamController\.enqueue\("((?:[^"\\]|\\.)*)"\)/g;
  const chunks: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      chunks.push(JSON.parse(`"${m[1]}"`) as string); // unescape JS literal
    } catch {
      // skip unparseable chunk
    }
  }
  if (chunks.length === 0) return null;

  const payload = chunks.join("");
  try {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(payload));
        controller.close();
      },
    });
    // The root loaderData is available on `value` immediately; we don't await
    // `done` (deferred promises aren't needed and could otherwise hang).
    const decoded = (await decode(stream)) as { value: unknown };
    return decoded.value;
  } catch {
    return null;
  }
}

// Keys various providers use for the model id, in priority order.
const STRONG_MODEL_KEYS = ["model_slug", "modelslug", "model_id", "modelid"];
const WEAK_MODEL_KEYS = [
  "default_model_slug",
  "modelname",
  "model_name",
  "modelversion",
  "model",
];

/** True for plausible model identifiers (e.g. "gpt-5-3-mini", "gemini-2.0-flash"). */
function looksLikeModelId(v: unknown): v is string {
  return (
    typeof v === "string" &&
    v.length > 1 &&
    v.length <= 64 &&
    !/\s/.test(v) &&
    v !== "auto" &&
    /[a-z]/i.test(v)
  );
}

/** Walk a decoded tree for an AI model id; prefer concrete per-message keys. */
function scanForModel(node: unknown, depth = 0): string | null {
  if (depth > 50 || node === null || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = scanForModel(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;
  let fallback: string | null = null;
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    const val = obj[key];
    if (STRONG_MODEL_KEYS.includes(lower) && looksLikeModelId(val)) return val;
    if (WEAK_MODEL_KEYS.includes(lower) && looksLikeModelId(val) && !fallback) {
      fallback = val;
    }
    const found = scanForModel(val, depth + 1);
    if (found) return found;
  }
  return fallback;
}

/**
 * Extract an ordered dialogue stream (and AI model, if detectable) from a
 * fetched share page. Returns empty messages when nothing is recognized.
 */
async function extractDialogueFromHtml(
  html: string,
): Promise<{ messages: DialogueMessage[]; model: string | null }> {
  const collected: RankedMessage[] = [];
  let model: string | null = null;

  // Strategy 1 — legacy inline <script> JSON blobs.
  for (const json of iterateScriptJson(html)) {
    collectMessages(json, collected);
    if (!model) model = scanForModel(json);
    if (collected.length > MAX_MESSAGES) break;
  }

  // Strategy 2 — current React Router turbo-stream payload.
  if (collected.length === 0) {
    const root = await decodeReactRouterStream(html);
    if (root) {
      collectMessages(root, collected);
      model = scanForModel(root);
    }
  }

  // De-duplicate (mappings can repeat nodes) while preserving first order.
  const seen = new Set<string>();
  const unique = collected.filter((m) => {
    const key = `${m.role}:${m.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => a.order - b.order);
  return {
    messages: unique.map(({ role, text }) => ({ role, text })),
    model,
  };
}

/**
 * Parse pasted raw text / Markdown into a structured stream.
 * Recognizes "User:" / "Assistant:" (and common synonyms) turn markers; when
 * none are present, the entire payload is captured as a single user turn.
 */
function parseDirectText(raw: string): DialogueMessage[] {
  const text = raw.trim();
  if (!text) return [];

  const markerRegex =
    /^\s*(user|you|human|prompt|assistant|ai|chatgpt|claude|gpt|response)\s*[:：]/i;

  const lines = text.split(/\r?\n/);
  const messages: DialogueMessage[] = [];
  let current: DialogueMessage | null = null;

  const roleFor = (label: string): DialogueMessage["role"] =>
    /^(assistant|ai|chatgpt|claude|gpt|response)$/i.test(label)
      ? "assistant"
      : "user";

  let sawMarker = false;
  for (const line of lines) {
    const m = line.match(markerRegex);
    if (m) {
      sawMarker = true;
      if (current && current.text.trim()) messages.push(current);
      const label = m[1];
      const rest = line.slice(m[0].length).trim();
      current = { role: roleFor(label), text: rest };
    } else if (current) {
      current.text += (current.text ? "\n" : "") + line;
    } else {
      current = { role: "user", text: line };
    }
  }
  if (current && current.text.trim()) messages.push(current);

  if (!sawMarker) {
    return [{ role: "user", text }];
  }
  return messages
    .map((m) => ({ role: m.role, text: m.text.trim() }))
    .filter((m) => m.text.length > 0);
}

/** Fetch the public share HTML with a timeout and a size guard. */
async function fetchShareHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SifirDususBot/1.0; +https://sifirdusus.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Share page returned HTTP ${res.status}.`);
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) {
      throw new Error("Share page payload exceeds the safe size limit.");
    }
    return new TextDecoder("utf-8").decode(buf);
  } finally {
    clearTimeout(timer);
  }
}

/** Instantiate the Pinata SDK lazily so missing env fails loudly at call time. */
function getPinata(): PinataSDK {
  const jwt = process.env.PINATA_JWT;
  if (!jwt || jwt === "YOUR_PINATA_JWT") {
    throw new Error(
      "PINATA_JWT is not configured on the server. Set it in .env.local.",
    );
  }
  return new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  });
}

/** Pin a sealed payload to IPFS and return the CID + metadata. */
async function pinPayload(
  payload: SealedPayload,
  name: string,
): Promise<{ cid: string; size: number }> {
  const pinata = getPinata();
  const upload = await pinata.upload.json(payload, {
    metadata: { name },
  });
  return { cid: upload.IpfsHash, size: upload.PinSize };
}

function buildPayload(
  messages: DialogueMessage[],
  origin: OriginInputType,
  platform: string,
  sourceUrl: string | null,
  sourceRef: string,
  authorName: string | null,
  model: string | null = null,
): SealedPayload {
  // Strip ChatGPT inline tool markers so the archived transcript is clean.
  const cleaned = messages
    .map((m) => ({ role: m.role, text: cleanDialogueText(m.text) }))
    .filter((m) => m.text.length > 0);
  return {
    schema: "decite/dialogue@1",
    origin,
    authorName: authorName?.trim() || null,
    sourceRef: sourceRef.trim(),
    sourceUrl,
    platform,
    model,
    messages: cleaned,
    capturedAt: new Date().toISOString(),
  };
}

// ─── Exported Server Actions ───────────────────────────────────────────────

/**
 * Option A — seal an official AI share link.
 * Validates the URL, fetches and parses the dialogue, then pins to IPFS.
 */
export async function sealFromShareLink(
  rawUrl: string,
  sourceRef: string,
  authorName: string | null = null,
): Promise<PinResult> {
  try {
    const info = classifyShareUrl(rawUrl);
    if (!info) {
      return {
        ok: false,
        error:
          `Unsupported share URL. Provide an official public share link from a supported provider (${SUPPORTED_PROVIDERS_LABEL}).`,
      };
    }

    if (info.mode === "paste-only") {
      return {
        ok: false,
        error:
          `${info.platform} renders the conversation in your browser and doesn't expose it to servers (it's loaded via a private request / bot-challenge), so it can't be read from a link. Please switch to the "Direct Text Capture" tab and paste the conversation — it produces a faithful, permanently sealed archive.`,
      };
    }

    const html = await fetchShareHtml(rawUrl.trim());
    const { messages, model } = await extractDialogueFromHtml(html);

    if (messages.length === 0) {
      return {
        ok: false,
        error:
          "Could not extract the dialogue from this share page. The platform may have changed its format — use Direct Text Capture instead.",
      };
    }

    const payload = buildPayload(
      messages,
      "share-link",
      info.platform,
      rawUrl.trim(),
      sourceRef,
      authorName,
      model,
    );
    const { cid, size } = await pinPayload(
      payload,
      `sdp-${info.platform.toLowerCase()}-${Date.now()}`,
    );

    return {
      ok: true,
      ipfsCID: cid,
      size,
      platform: info.platform,
      model,
      origin: "share-link",
      sourceUrl: rawUrl.trim(),
      messageCount: payload.messages.length,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Unexpected error while sealing the share link.",
    };
  }
}

/**
 * Option B — seal directly pasted text / Markdown.
 * Bypasses scraping entirely and pins the normalized JSON payload.
 */
export async function sealFromDirectText(
  rawText: string,
  sourceRef: string,
  authorName: string | null = null,
): Promise<PinResult> {
  try {
    if (!rawText || !rawText.trim()) {
      return { ok: false, error: "No conversation content was provided." };
    }
    if (rawText.length > MAX_TEXT_CHARS) {
      return { ok: false, error: "Pasted content exceeds the size limit." };
    }

    const messages = parseDirectText(rawText);
    if (messages.length === 0) {
      return { ok: false, error: "No usable dialogue content was found." };
    }

    const payload = buildPayload(
      messages,
      "direct-paste",
      "Manual",
      null,
      sourceRef,
      authorName,
    );
    const { cid, size } = await pinPayload(payload, `sdp-manual-${Date.now()}`);

    return {
      ok: true,
      ipfsCID: cid,
      size,
      platform: "Manual",
      model: null,
      origin: "direct-paste",
      sourceUrl: null,
      messageCount: messages.length,
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Unexpected error while sealing the pasted text.",
    };
  }
}
