/**
 * Registry of AI chat products whose public share links DeCite accepts.
 * Pure + isomorphic: used by the client (input validation) and the server
 * parser (platform labelling). Extend SHARE_PROVIDERS to add more products.
 */

/**
 * "scrape" - the conversation is present in the server-fetched HTML and can be
 *            extracted.
 * "paste-only" - the product renders the conversation client-side and/or hides
 *            it behind a bot challenge, so a server can't read it. The link is
 *            still recognized, but the user is routed to Direct Text Capture.
 */
export type ProviderMode = "scrape" | "paste-only";

export interface ShareProvider {
  /** Display label, e.g. "ChatGPT". */
  name: string;
  /** True when the given URL is a share link for this provider. */
  test: (url: URL) => boolean;
  /** Defaults to "scrape". */
  mode?: ProviderMode;
}

function hostIs(url: URL, ...hosts: string[]): boolean {
  return hosts.some(
    (h) => url.hostname === h || url.hostname.endsWith(`.${h}`),
  );
}

export const SHARE_PROVIDERS: ShareProvider[] = [
  {
    name: "ChatGPT",
    test: (u) =>
      hostIs(u, "chatgpt.com", "openai.com") && u.pathname.startsWith("/share/"),
  },
  {
    name: "Claude",
    test: (u) => hostIs(u, "claude.ai") && u.pathname.includes("/share/"),
  },
  {
    name: "Gemini",
    test: (u) =>
      hostIs(u, "gemini.google.com") && u.pathname.includes("/share/"),
    // Conversation is loaded client-side via Google's RPC; not in server HTML.
    mode: "paste-only",
  },
  {
    name: "Grok",
    test: (u) => hostIs(u, "grok.com") && u.pathname.includes("/share/"),
  },
  {
    name: "Microsoft Copilot",
    test: (u) =>
      hostIs(u, "copilot.microsoft.com") && /\/shares?\//.test(u.pathname),
  },
  {
    name: "Perplexity",
    test: (u) => hostIs(u, "perplexity.ai") && /^\/(search|page)\//.test(u.pathname),
  },
  {
    name: "DeepSeek",
    test: (u) => hostIs(u, "deepseek.com") && /\/(share|s)\//.test(u.pathname),
    // Served behind an AWS WAF JS bot-challenge; servers get no content.
    mode: "paste-only",
  },
  {
    name: "Poe",
    test: (u) => hostIs(u, "poe.com") && u.pathname.startsWith("/s/"),
  },
  {
    name: "Mistral Le Chat",
    test: (u) => hostIs(u, "mistral.ai") && /\/(chat|share)\//.test(u.pathname),
  },
  {
    name: "Meta AI",
    test: (u) => hostIs(u, "meta.ai") && /^\/(c|s|share)\//.test(u.pathname),
  },
  {
    name: "Qwen",
    test: (u) => hostIs(u, "qwen.ai") && /\/(s|share|c)\//.test(u.pathname),
  },
  {
    name: "Kimi",
    test: (u) =>
      hostIs(u, "kimi.com", "moonshot.cn") && /\/(share|chat|s)\//.test(u.pathname),
  },
  {
    name: "HuggingChat",
    test: (u) => hostIs(u, "huggingface.co") && /^\/chat\/(r|share)\//.test(u.pathname),
  },
  {
    name: "You.com",
    test: (u) => hostIs(u, "you.com") && /\/(search|chat)\//.test(u.pathname),
  },
];

/** Friendly, comma-separated list of supported providers for UI copy. */
export const SUPPORTED_PROVIDERS_LABEL = SHARE_PROVIDERS.map((p) => p.name).join(", ");

/** Classify a raw URL string to its provider, or null if unsupported. */
export function classifyShareUrl(
  raw: string,
): { platform: string; mode: ProviderMode } | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  for (const provider of SHARE_PROVIDERS) {
    if (provider.test(url)) {
      return { platform: provider.name, mode: provider.mode ?? "scrape" };
    }
  }
  return null;
}

/** Cheap boolean form for client-side input validation. */
export function isShareUrl(raw: string): boolean {
  return classifyShareUrl(raw) !== null;
}

// Hostname → platform label, for provenance links that aren't /share/ URLs.
const HOST_PLATFORMS: [RegExp, string][] = [
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/i, "ChatGPT"],
  [/(^|\.)claude\.ai$/i, "Claude"],
  [/(^|\.)gemini\.google\.com$/i, "Gemini"],
  [/(^|\.)grok\.com$/i, "Grok"],
  [/(^|\.)copilot\.microsoft\.com$/i, "Microsoft Copilot"],
  [/(^|\.)perplexity\.ai$/i, "Perplexity"],
  [/(^|\.)deepseek\.com$/i, "DeepSeek"],
  [/(^|\.)poe\.com$/i, "Poe"],
  [/(^|\.)mistral\.ai$/i, "Mistral Le Chat"],
  [/(^|\.)meta\.ai$/i, "Meta AI"],
  [/(^|\.)qwen\.ai$/i, "Qwen"],
  [/(^|\.)kimi\.com$|(^|\.)moonshot\.cn$/i, "Kimi"],
  [/(^|\.)huggingface\.co$/i, "HuggingChat"],
  [/(^|\.)you\.com$/i, "You.com"],
];

/**
 * Best-effort platform label from any URL on a known AI host (path-agnostic).
 * Used to attribute a manually-pasted conversation to its source AI.
 */
export function detectPlatformFromUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  for (const [re, name] of HOST_PLATFORMS) {
    if (re.test(url.hostname)) return name;
  }
  return null;
}

/** Normalize a user-supplied URL to a stored https(s) link, or null. */
export function normalizeUrl(raw: string): string | null {
  if (!raw?.trim()) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
  } catch {
    /* ignore */
  }
  return null;
}
