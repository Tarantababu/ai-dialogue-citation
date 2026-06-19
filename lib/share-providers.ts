/**
 * Registry of AI chat products whose public share links DeCite accepts.
 * Pure + isomorphic: used by the client (input validation) and the server
 * parser (platform labelling). Extend SHARE_PROVIDERS to add more products.
 */

export interface ShareProvider {
  /** Display label, e.g. "ChatGPT". */
  name: string;
  /** True when the given URL is a share link for this provider. */
  test: (url: URL) => boolean;
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
export function classifyShareUrl(raw: string): { platform: string } | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  for (const provider of SHARE_PROVIDERS) {
    if (provider.test(url)) return { platform: provider.name };
  }
  return null;
}

/** Cheap boolean form for client-side input validation. */
export function isShareUrl(raw: string): boolean {
  return classifyShareUrl(raw) !== null;
}
