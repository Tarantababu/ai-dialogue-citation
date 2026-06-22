"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { localeFromLanguages } from "@/lib/locale-detect";

/**
 * Minimal, dependency-free i18n covering the 10 most-used world languages
 * (plus Turkish). English is the default & fallback locale. Copy is written in
 * plain language for a non-technical, academic audience; the term "AI" is used
 * verbatim across every language. Any missing key falls back to English.
 */

export type Locale =
  | "en"
  | "zh"
  | "hi"
  | "es"
  | "fr"
  | "ar"
  | "pt"
  | "ru"
  | "de"
  | "ja"
  | "tr";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "tr", label: "Türkçe" },
];

const RTL_LOCALES = new Set<Locale>(["ar"]);

type Dict = Record<string, string>;

const en: Dict = {
  "brand.name": "DeCite",
  "brand.tagline": "Permanent, verifiable citations for your conversations with AI",

  "nav.home": "Manifesto",
  "nav.mint": "Seal a Dialogue",
  "nav.verify": "Verify",
  "nav.receipts": "My Receipts",
  "nav.feedback": "Feedback",
  "nav.faq": "FAQ",
  "nav.language": "Language",

  "cta.mint.title": "For authors",
  "cta.mint.desc": "Permanently save a conversation you had with an AI and get a citation you can put in your work.",
  "cta.mint.action": "Create a citation",
  "cta.verify.title": "For readers & reviewers",
  "cta.verify.desc": "Enter any citation code to read the exact conversation it refers to.",
  "cta.verify.action": "Look up a citation",

  "home.eyebrow": "Honest attribution for the age of AI",
  "home.hero.title": "AI helped you think it through. Now cite it.",
  "home.hero.lede":
    "More and more research takes shape in conversation with AI — but those conversations quietly disappear, get edited, or can't be proven later. DeCite saves a conversation permanently and gives you a short citation code to put in your paper or book. Anyone can then look it up and read exactly what was said, and when. No account, no payment, and nothing technical to learn.",
  "home.crisis.title": "When the conversation disappears, so does the proof",
  "home.crisis.body":
    "A shared chat link can stop working, and a platform can edit or delete a conversation at any time. When that happens, a reviewer can no longer check what was asked, what the AI answered, or when it happened — and your attribution becomes just your word. DeCite makes the conversation permanent, so it can always be read back exactly as it was, even if the original platform is long gone.",
  "home.pillars.permanence.title": "Permanent",
  "home.pillars.permanence.body": "Once saved, the conversation can't be edited or quietly taken down — not by us, not by anyone.",
  "home.pillars.timestamp.title": "Time-stamped",
  "home.pillars.timestamp.body": "Each citation records the exact date and time it was saved, so the timing can never be disputed.",
  "home.pillars.citation.title": "Easy to cite",
  "home.pillars.citation.body": "You get a short, clean code like DC-20260619-01 to drop straight into a paper or book.",
  "home.quote":
    "A citation is a promise that the source can be found. We are simply keeping the promise.",

  "mint.title": "Seal a Dialogue",
  "mint.subtitle": "Save the conversation permanently and get a citation you can quote.",
  "mint.noWallet":
    "Nothing technical required. DeCite saves and permanently registers the conversation for you — just paste it and click Seal.",
  "mint.freeLaunch":
    "Free while we launch — no account, no card. DeCite saves your conversation permanently and registers it for you. Add your email and we'll send you the citation.",
  "mint.tab.link": "Official Share Link",
  "mint.tab.paste": "Direct Text Capture",
  "mint.link.label": "AI share link",
  "mint.link.placeholder": "https://chatgpt.com/share/…  ·  claude.ai/share/…  ·  grok, perplexity…",
  "mint.link.help":
    "An official public share link from ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen and more. Some platforms (e.g. Gemini, DeepSeek) hide the chat from outside readers — use Direct Text Capture for those.",
  "mint.paste.label": "Conversation text",
  "mint.paste.placeholder": "Paste the conversation here. If you can, start each turn with 'User:' and 'Assistant:'.",
  "mint.paste.help": "Use this when the AI offers no public share link — it saves exactly what you paste.",
  "mint.originUrl.label": "Link to the original AI conversation (optional)",
  "mint.originUrl.placeholder": "https://chatgpt.com/share/…  ·  gemini.google.com/share/…",
  "mint.originUrl.help":
    "Paste the link to the original chat (any AI). It records which AI you used and lets readers open the source — while the text above is what gets saved.",
  "mint.originUrl.detected": "Detected AI: {provider} — this will be recorded with your citation.",
  "mint.sourceRef.label": "Where you'll use it (work title)",
  "mint.sourceRef.placeholder": "e.g. On the Ethics of Synthetic Reasoning (2026), Ch. 3",
  "mint.author.label": "Your name for the citation (optional)",
  "mint.author.placeholder": "e.g. Maria Garcia",
  "mint.email.label": "Email (optional)",
  "mint.email.placeholder": "you@example.com",
  "mint.email.help": "We'll email you the citation and keep it under My Receipts so you can find it later.",
  "mint.step.pin": "Saving the conversation to a permanent archive",
  "mint.step.code": "Reserving your citation code",
  "mint.step.notarize": "Recording it in the public registry",
  "mint.step.wait": "This takes a few seconds — please keep this page open.",
  "mint.action.seal": "Seal & create citation",
  "mint.action.sealing": "Sealing…",
  "mint.action.sealFree": "Seal for Free",
  "mint.action.pay": "Pay ${price} & Seal",
  "mint.action.preparing": "Preparing secure checkout…",
  "mint.pay.note":
    "A one-time ${price} fee covers saving and permanently registering your conversation. Payment is handled securely by Stripe — we never see or store your card details.",
  "mint.canceled": "Checkout canceled. Your conversation was not saved.",
  "mint.success.title": "Saved & registered",
  "mint.success.desc": "Your conversation is now permanent. Copy the citation below for your bibliography.",
  "mint.success.code": "Citation code",
  "mint.success.tx": "Public record",
  "mint.success.apa": "Citation (APA style)",
  "mint.success.custodian": "Permanently registered by DeCite on your behalf",
  "mint.copy": "Copy",
  "mint.copied": "Copied",
  "mint.viewVerify": "Open the citation page",
  "mint.error.badLink": "Enter a valid public AI share link (ChatGPT, Claude, Grok, Perplexity, and more).",
  "mint.pasteOnlyHint":
    "{provider} keeps the conversation inside your browser, so it can't be read from a link. Open your {provider} chat, select all and copy it, then paste it here — DeCite saves exactly what you paste.",
  "mint.switchToPaste": "Use Direct Text Capture",
  "mint.error.empty": "Please add the conversation.",
  "mint.error.sourceRef": "Please say where you'll use it.",
  "mint.warn.noContract": "This site isn't fully set up for sealing yet.",

  "verify.title": "Look up a citation",
  "verify.subtitle": "Enter a citation code to read the exact conversation behind it.",
  "verify.input.placeholder": "Enter a citation code, e.g. DC-20260619-01",
  "verify.action": "Look up",
  "verify.error.format": "That doesn't look like a valid citation code (DC-YYYYMMDD-NN).",
  "verify.error.notFound": "No citation was found for this code.",
  "verify.error.config": "Look-up isn't set up on this site yet.",
  "verify.loading": "Looking up the citation…",
  "verify.sealed": "SEALED & VERIFIED",
  "verify.meta.title": "Citation details",
  "verify.meta.timestamp": "Date sealed",
  "verify.meta.ai": "AI / Model",
  "verify.cite.title": "Ready to cite",
  "verify.cite.help":
    "Copy this reference straight into your paper or book bibliography (APA 7 style).",
  "verify.meta.authorName": "Author",
  "verify.meta.custodian": "Sealed by",
  "verify.meta.registry": "Public registry",
  "verify.meta.origin": "How it was added",
  "verify.meta.cid": "Archive ID",
  "verify.meta.code": "Citation code",
  "verify.origin.link": "The original AI conversation",
  "verify.origin.open": "Open the original (external site)",
  "verify.origin.warn": "External link — the original platform may have changed or removed this conversation.",
  "verify.ipfs.title": "Permanent archive",
  "verify.ipfs.desc": "Read straight from the permanent public archive — available even if the original conversation is deleted.",
  "verify.ipfs.open": "Open the saved file",
  "verify.role.user": "User",
  "verify.role.assistant": "Assistant",
  "verify.back": "Look up another code",
  "verify.perm.title": "Always reachable — even without DeCite",
  "verify.perm.body":
    "This citation is kept in two independent public places that no single company controls: a permanent public registry and a permanent public archive. Anyone can open either one directly, forever — even if the DeCite website ever goes away. Here are both ways to reach this exact record without us.",
  "verify.perm.chain": "The public registry",
  "verify.perm.callHint": "Search for your code, {code}, in the public registry:",
  "verify.perm.readOn": "Open the public registry",
  "verify.perm.ipfs": "The permanent archive",
  "verify.perm.ipfsHint": "Open the saved conversation from any public mirror of the archive:",
  "verify.perm.note":
    "DeCite is just a convenient way to read all this. The citation itself lives on independent public infrastructure and survives without us.",
  "home.independent.title": "Your citations don't depend on us",
  "home.independent.body":
    "Every citation is saved in two independent public places that no single company controls. If DeCite ever disappeared, your references would stay permanently readable and verifiable on their own — no website, no account, and no permission needed.",
  "home.independent.viewRegistry": "See the public registry",

  "success.error.title": "We couldn't finish sealing your conversation",
  "success.retry": "Back to sealing",
  "success.sealAnother": "Seal another conversation",

  "receipts.title": "My Receipts",
  "receipts.subtitle": "Enter the email you used when sealing to find your citation codes.",
  "receipts.placeholder": "you@example.com",
  "receipts.action": "Find",
  "receipts.empty": "No citations found for this email yet.",
  "receipts.notConfigured":
    "Saved receipts aren't available on this site yet.",

  "feedback.title": "Feedback & Suggestions",
  "feedback.subtitle": "Tell us what to improve, report a problem, or share an idea. We read everything.",
  "feedback.type.label": "What kind of feedback?",
  "feedback.type.suggestion": "Suggestion",
  "feedback.type.bug": "Problem",
  "feedback.type.praise": "Praise",
  "feedback.type.other": "Other",
  "feedback.message.label": "Your message",
  "feedback.message.placeholder": "What's on your mind? The more specific, the better.",
  "feedback.email.label": "Email (optional)",
  "feedback.email.placeholder": "you@example.com",
  "feedback.email.help": "Only if you'd like a reply. We won't use it for anything else.",
  "feedback.submit": "Send Feedback",
  "feedback.sending": "Sending…",
  "feedback.error.empty": "Please enter a message.",
  "feedback.error.generic": "Something went wrong. Please try again.",
  "feedback.thanks.title": "Thank you!",
  "feedback.thanks.body": "Your feedback was received. It genuinely helps shape DeCite.",
  "feedback.thanks.again": "Send more feedback",
  "feedback.thanks.home": "Back to home",

  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "Frequently asked questions",
  "faq.subtitle":
    "Everything about sealing a conversation with AI, citing it, and how the proof stays readable forever. Can't find your question? Send it through Feedback — we answer everything.",
  "faq.group.about": "About DeCite",
  "faq.group.sealing": "Sealing a conversation",
  "faq.group.citation": "Your citation",
  "faq.group.readers": "For readers & reviewers",
  "faq.group.trust": "Permanence & trust",
  "faq.group.privacy": "Privacy & safety",
  "faq.stillTitle": "Still have a question?",
  "faq.stillBody":
    "If something here didn't answer it, ask us directly — we read every message and usually reply within a day.",
  "faq.stillCta": "Ask a question",
  "faq.sealCta": "Seal a dialogue",

  "faq.q.what": "What is DeCite?",
  "faq.a.what":
    "DeCite saves a conversation you had with an AI to a permanent public record and gives you a short citation code — like DC-20260619-01 — that you can put in your paper, book, or article. Anyone who has the code can later look it up and read the exact conversation, word for word, along with the date and time it was saved. It turns a chat that could disappear into a source that can always be checked.",
  "faq.q.who": "Who is it for?",
  "faq.a.who":
    "Anyone whose thinking took shape in conversation with an AI and who wants to attribute it honestly — researchers, students, authors, journalists, and educators. Authors use it to create a citable, permanent record; readers, reviewers, and editors use it to verify exactly what an AI was asked and what it answered.",
  "faq.q.free":
    "Is it really free? Is there a catch?",
  "faq.a.free":
    "Sealing is free while we launch — no account, no card, no hidden step. We cover the cost of saving and permanently registering each conversation for you. If that ever changes, the price will be shown clearly before you seal anything, and conversations already sealed stay sealed forever.",

  "faq.q.how": "How do I seal a conversation?",
  "faq.a.how":
    "Paste either a public share link to your AI chat or the conversation text itself, add a short title for where you'll use it, and click Seal. In a few seconds DeCite saves the conversation to a permanent archive, reserves your citation code, and records it in a public registry. You'll see the citation right away, and we'll email it to you if you add your address.",
  "faq.q.linkVsPaste":
    "What's the difference between 'Official Share Link' and 'Direct Text Capture'?",
  "faq.a.linkVsPaste":
    "Use Official Share Link when your AI gives you a public link that anyone can open — DeCite reads the conversation from it and saves a permanent copy. Use Direct Text Capture when there's no public link: you paste the conversation text yourself and DeCite saves exactly what you paste. Both produce the same kind of permanent, citable record.",
  "faq.q.platforms": "Which AI platforms are supported?",
  "faq.a.platforms":
    "Public share links work from ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen, and more. For any AI that doesn't offer a public link — or for a private chat you'd rather paste — use Direct Text Capture, which works with any tool, including ones not on this list.",
  "faq.q.gemini":
    "Gemini or DeepSeek don't give me a public link. What do I do?",
  "faq.a.gemini":
    "Some platforms keep the chat inside your browser, so a link can't be read by outside readers. Open the conversation, select and copy the text, then switch to Direct Text Capture and paste it. DeCite saves exactly what you paste. You can also add the original chat link in the optional field so your citation records which AI you used.",
  "faq.q.account": "Do I need an account, a payment, or a crypto wallet?",
  "faq.a.account":
    "No. There's no sign-up, no card, and nothing to install. You don't need a wallet or any technical knowledge — DeCite handles the saving and registering for you behind the scenes. An email is optional, and only used to send you the citation and let you find it again later.",
  "faq.q.time": "How long does sealing take?",
  "faq.a.time":
    "Usually just a few seconds. Keep the page open while it works — DeCite is saving the conversation to a permanent archive, reserving your code, and recording it in the public registry. When it's done you'll see your citation immediately.",
  "faq.q.language": "Can I seal a conversation in any language?",
  "faq.a.language":
    "Yes. DeCite saves the conversation text exactly as it is, in any language and script. The interface itself is available in several languages — switch it any time from the language menu in the top bar.",

  "faq.q.code": "What does the citation code look like?",
  "faq.a.code":
    "It's a short, clean code in the form DC-YYYYMMDD-NN — for example DC-20260619-01, meaning the first conversation sealed on 19 June 2026. It's easy to type into a bibliography and easy for a reader to look up.",
  "faq.q.cite": "How do I cite it in my paper or book?",
  "faq.a.cite":
    "When you seal a conversation, DeCite gives you a ready-made reference in APA 7 style that you can copy straight into your bibliography, along with the citation code and the public-record link. You're free to adapt it to whatever style your journal or publisher requires.",
  "faq.q.edit":
    "Can I edit or update a conversation after sealing it?",
  "faq.a.edit":
    "No — and that's the whole point. A sealed conversation can't be changed by anyone, including us, which is exactly what makes it trustworthy as a citation. If the conversation continued or you want to capture a newer version, simply seal it again to get a separate citation.",
  "faq.q.lost": "I lost my citation code. How do I find it again?",
  "faq.a.lost":
    "If you added your email when sealing, go to My Receipts and enter that same email to see all the citation codes tied to it. If you didn't add an email, you'll need the code itself to look the conversation up — so keep it somewhere safe.",

  "faq.q.lookup": "How does someone look up my citation?",
  "faq.a.lookup":
    "They go to the Verify page, type in the citation code, and the exact sealed conversation opens — the full text, the date and time it was sealed, and which AI was used. No account or payment is needed to read it.",
  "faq.q.readerAccount":
    "Do readers or reviewers need an account to verify?",
  "faq.a.readerAccount":
    "No. Anyone with the code can read the conversation, for free, with no sign-up. Because the record also lives on independent public infrastructure, a determined reviewer can even verify it without using the DeCite website at all.",

  "faq.q.where": "Where is the conversation actually stored?",
  "faq.a.where":
    "In two independent public places that no single company controls: a permanent public archive that holds the full conversation, and a public registry that records its citation code and the moment it was sealed. DeCite is just a convenient window onto both — the record doesn't depend on us to exist.",
  "faq.q.ifGone": "What happens if DeCite ever disappears?",
  "faq.a.ifGone":
    "Your citations keep working. Because each one is stored on independent public infrastructure, anyone can still open the public registry and the permanent archive directly — no website, no account, and no permission needed. The proof outlives the company.",
  "faq.q.timestamp": "How do I know the date and time can be trusted?",
  "faq.a.timestamp":
    "When a conversation is sealed, the exact date and time are written into a public registry that can't be quietly altered afterwards. So the timing isn't just our word — anyone can check it independently, which is what makes it hold up under scrutiny.",

  "faq.q.public": "Is the sealed conversation public? Who can see it?",
  "faq.a.public":
    "Yes. A sealed conversation is meant to be citable, so anyone who has the citation code can read it, and it stays public permanently. Only seal conversations you're comfortable making public for good.",
  "faq.q.sensitive":
    "What about personal or confidential information in the chat?",
  "faq.a.sensitive":
    "Because sealing is permanent and public, remove anything private or sensitive — names, contact details, unpublished data, anything confidential — before you seal. Once a conversation is sealed it cannot be edited or taken down, so review the text carefully first.",
  "faq.q.email": "Do you store my email, and what for?",
  "faq.a.email":
    "Email is optional. If you provide one, we use it only to send you your citation and to let you find your codes again under My Receipts. It isn't part of the public record and we don't use it for anything else.",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "Latest",
  "nav.more": "More",
  "mint.share.label": "List in the public “Latest citations” feed",
  "mint.share.help":
    "On by default. Anyone with the code can already read a sealed citation; this simply lists it publicly so others can discover it. Turn it off to keep it out of the feed.",
  "latest.title": "Latest citations",
  "latest.subtitle":
    "Recently sealed conversations that authors chose to share publicly. Open any one to read the exact dialogue behind it.",
  "latest.loading": "Loading the latest citations…",
  "latest.empty": "No public citations yet — seal one and it can appear here.",
  "latest.notConfigured": "The public feed isn’t available on this site yet.",
  "latest.error": "The feed couldn’t be loaded right now. Please try again.",
  "latest.anon": "Anonymous",
  "latest.viewAll": "View all",
  "latest.sealCta": "Seal a dialogue",

  "footer.note": "Permanent · Time-stamped · Independently verifiable",
  "common.user": "User",
  "common.assistant": "Assistant",
};

// ─── 中文 (Simplified Chinese) ───────────────────────────────────────────────
const zh: Dict = {
  "brand.tagline": "为你与 AI 的对话，提供永久、可核验的引用",
  "nav.home": "理念",
  "nav.mint": "封存对话",
  "nav.verify": "查询",
  "nav.receipts": "我的凭证",
  "nav.feedback": "反馈",
  "nav.faq": "常见问题",
  "nav.language": "语言",
  "cta.mint.title": "面向作者",
  "cta.mint.desc": "把你与 AI 的一次对话永久保存下来，并获得可写入著作的引用。",
  "cta.mint.action": "创建引用",
  "cta.verify.title": "面向读者与审阅者",
  "cta.verify.desc": "输入任意引用代码，读取它所指向的确切对话。",
  "cta.verify.action": "查询引用",
  "home.eyebrow": "为 AI 时代提供诚实的署名",
  "home.hero.title": "AI 陪你把思路想透了。现在，为它署上引用。",
  "home.hero.lede":
    "越来越多的研究在与 AI 的对话中成形——但这些对话会悄然消失、被修改，或日后无法证明。DeCite 把一次对话永久保存，并给你一个简短的引用代码，写入论文或书籍。任何人都可随后查询，读到当时确切说了什么、何时说的。无需账户、无需付费，也不必学习任何技术。",
  "home.crisis.title": "对话一旦消失，证据也随之消失",
  "home.crisis.body":
    "分享的聊天链接可能失效，平台也可能随时修改或删除对话。一旦如此，审阅者便无法核对问了什么、AI 答了什么、发生在何时——你的署名只剩一面之词。DeCite 让对话永久留存，从而始终能原样读回，即使原始平台早已不在。",
  "home.pillars.permanence.title": "永久保存",
  "home.pillars.permanence.body": "一经保存，对话便无法被修改或悄悄撤下——无论是我们还是任何人。",
  "home.pillars.timestamp.title": "时间戳记",
  "home.pillars.timestamp.body": "每条引用都记录其保存的确切日期与时间，时间从此无可争议。",
  "home.pillars.citation.title": "便于引用",
  "home.pillars.citation.body": "你会得到一个简短清晰的代码，如 DC-20260619-01，可直接写入论文或书籍。",
  "home.quote": "引用是一种承诺：来源可以被找到。我们只是信守这个承诺。",
  "mint.title": "封存对话",
  "mint.subtitle": "把对话永久保存下来，并获得可引用的引用。",
  "mint.noWallet": "无需任何技术。DeCite 代你保存并永久登记对话——只需粘贴并点击“封存”。",
  "mint.freeLaunch": "上线期间免费——无需账户、无需银行卡。DeCite 代你永久保存并登记对话。填写邮箱，我们会把引用发给你。",
  "mint.tab.link": "官方分享链接",
  "mint.tab.paste": "直接粘贴文本",
  "mint.link.label": "AI 分享链接",
  "mint.link.help": "来自 ChatGPT、Claude、Grok、Copilot、Perplexity、Poe、Mistral、Meta AI、Qwen 等的官方公开分享链接。部分平台（如 Gemini、DeepSeek）对外部读者隐藏对话——对这些请使用“直接粘贴文本”。",
  "mint.paste.label": "对话文本",
  "mint.paste.placeholder": "在此粘贴对话。可以的话，每轮以 'User:' 和 'Assistant:' 开头。",
  "mint.paste.help": "当 AI 不提供公开分享链接时使用——粘贴什么就保存什么。",
  "mint.originUrl.label": "原始 AI 对话链接（可选）",
  "mint.originUrl.help": "粘贴原始对话的链接（任意 AI）。它会记录你用了哪种 AI，并让读者打开来源——而上方文本才是被保存的内容。",
  "mint.originUrl.detected": "检测到 AI：{provider} — 将随你的引用一同记录。",
  "mint.sourceRef.label": "用于何处（著作标题）",
  "mint.sourceRef.placeholder": "例如《论合成推理的伦理》(2026)，第 3 章",
  "mint.author.label": "引用中的署名（可选）",
  "mint.email.label": "邮箱（可选）",
  "mint.email.help": "我们会把引用发到这个邮箱，并存入“我的凭证”，方便你日后查找。",
  "mint.step.pin": "正在把对话保存到永久存档",
  "mint.step.code": "正在预留你的引用代码",
  "mint.step.notarize": "正在登记到公共登记表",
  "mint.step.wait": "这需要几秒钟——请保持本页打开。",
  "mint.action.seal": "封存并生成引用",
  "mint.action.sealing": "封存中…",
  "mint.action.sealFree": "免费封存",
  "mint.action.pay": "支付 ${price} 并封存",
  "mint.action.preparing": "正在准备安全结账…",
  "mint.pay.note": "一次性 ${price} 费用涵盖保存与永久登记你的对话。结账由 Stripe 安全处理——我们绝不查看或存储你的卡片信息。",
  "mint.canceled": "结账已取消。你的对话未被保存。",
  "mint.success.title": "已保存并登记",
  "mint.success.desc": "你的对话现已永久保存。复制下方引用，写入你的参考文献。",
  "mint.success.code": "引用代码",
  "mint.success.tx": "公共记录",
  "mint.success.apa": "引用（APA 格式）",
  "mint.success.custodian": "由 DeCite 代你永久登记",
  "mint.copy": "复制",
  "mint.copied": "已复制",
  "mint.viewVerify": "打开引用页面",
  "mint.error.badLink": "请输入有效的公开 AI 分享链接（ChatGPT、Claude、Grok、Perplexity 等）。",
  "mint.pasteOnlyHint": "{provider} 把对话保存在你的浏览器内，因此无法从链接读取。请打开你的 {provider} 对话，全选并复制，然后粘贴到此处——粘贴什么 DeCite 就保存什么。",
  "mint.switchToPaste": "改用直接粘贴文本",
  "mint.error.empty": "请添加对话内容。",
  "mint.error.sourceRef": "请填写用于何处。",
  "mint.warn.noContract": "本站尚未完成封存功能的设置。",
  "verify.title": "查询引用",
  "verify.subtitle": "输入引用代码，读取其背后的确切对话。",
  "verify.input.placeholder": "输入引用代码，例如 DC-20260619-01",
  "verify.action": "查询",
  "verify.error.format": "这看起来不是有效的引用代码（DC-YYYYMMDD-NN）。",
  "verify.error.notFound": "未找到该代码对应的引用。",
  "verify.error.config": "本站尚未设置查询功能。",
  "verify.loading": "正在查询引用…",
  "verify.sealed": "已封存并核验",
  "verify.meta.title": "引用详情",
  "verify.meta.timestamp": "封存日期",
  "verify.meta.ai": "AI / 模型",
  "verify.cite.title": "可直接引用",
  "verify.cite.help": "将此引用直接复制到你的论文或书籍参考文献中（APA 第 7 版格式）。",
  "verify.meta.authorName": "作者",
  "verify.meta.custodian": "封存方",
  "verify.meta.registry": "公共登记表",
  "verify.meta.origin": "添加方式",
  "verify.meta.cid": "存档编号",
  "verify.meta.code": "引用代码",
  "verify.origin.link": "原始 AI 对话",
  "verify.origin.open": "打开原文（外部站点）",
  "verify.origin.warn": "外部链接——原始平台可能已更改或删除该对话。",
  "verify.ipfs.title": "永久存档",
  "verify.ipfs.desc": "直接从永久公共存档读取——即使原始对话被删除也可用。",
  "verify.ipfs.open": "打开已保存的文件",
  "verify.role.user": "用户",
  "verify.role.assistant": "助手",
  "verify.back": "查询另一个代码",
  "verify.perm.title": "始终可达——即使没有 DeCite",
  "verify.perm.body": "这条引用保存在两处互相独立、不受任何单一公司控制的公共场所：一个永久公共登记表和一个永久公共存档。任何人都可直接打开其中之一，且永久有效——即使 DeCite 网站日后不复存在。以下是无需我们也能找到这条确切记录的两种方式。",
  "verify.perm.chain": "公共登记表",
  "verify.perm.callHint": "在公共登记表中搜索你的代码 {code}：",
  "verify.perm.readOn": "打开公共登记表",
  "verify.perm.ipfs": "永久存档",
  "verify.perm.ipfsHint": "从该存档的任意公共镜像打开已保存的对话：",
  "verify.perm.note": "DeCite 只是阅读这一切的便捷方式。引用本身位于独立的公共基础设施上，没有我们也能存续。",
  "home.independent.title": "你的引用不依赖于我们",
  "home.independent.body": "每条引用都保存在两处互相独立、不受任何单一公司控制的公共场所。即使 DeCite 消失，你的引用仍可自行永久读取与核验——无需网站、无需账户、无需许可。",
  "home.independent.viewRegistry": "查看公共登记表",
  "success.error.title": "无法完成对话的封存",
  "success.retry": "返回封存",
  "success.sealAnother": "封存另一段对话",
  "receipts.title": "我的凭证",
  "receipts.subtitle": "输入你封存时使用的邮箱，以查找你的引用代码。",
  "receipts.action": "查找",
  "receipts.empty": "尚未找到与此邮箱关联的引用。",
  "receipts.notConfigured": "本站尚未提供已保存凭证功能。",
  "feedback.title": "反馈与建议",
  "feedback.subtitle": "告诉我们需要改进什么、报告问题，或分享想法。我们会认真阅读每一条。",
  "feedback.type.label": "哪种类型的反馈？",
  "feedback.type.suggestion": "建议",
  "feedback.type.bug": "问题",
  "feedback.type.praise": "赞赏",
  "feedback.type.other": "其他",
  "feedback.message.label": "你的留言",
  "feedback.message.placeholder": "你在想什么？越具体越好。",
  "feedback.email.label": "邮箱（可选）",
  "feedback.email.help": "仅当你希望得到回复时填写。我们不会用于其他用途。",
  "feedback.submit": "发送反馈",
  "feedback.sending": "发送中…",
  "feedback.error.empty": "请输入留言。",
  "feedback.error.generic": "出了点问题。请重试。",
  "feedback.thanks.title": "谢谢你！",
  "feedback.thanks.body": "我们已收到你的反馈。它确实帮助塑造 DeCite。",
  "feedback.thanks.again": "再发送一条",
  "feedback.thanks.home": "返回首页",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "常见问题",
  "faq.subtitle":
    "关于如何封存与 AI 的对话、如何引用它，以及凭证如何永久可读的一切。没有找到你的问题？通过“反馈”发送给我们——我们会回答所有问题。",
  "faq.group.about": "关于 DeCite",
  "faq.group.sealing": "封存对话",
  "faq.group.citation": "你的引用",
  "faq.group.readers": "面向读者与审稿人",
  "faq.group.trust": "永久性与可信度",
  "faq.group.privacy": "隐私与安全",
  "faq.stillTitle": "还有疑问？",
  "faq.stillBody":
    "如果这里没有解答你的问题，可以直接问我们——我们会阅读每一条消息，通常一天内回复。",
  "faq.stillCta": "提出问题",
  "faq.sealCta": "封存对话",

  "faq.q.what": "DeCite 是什么？",
  "faq.a.what":
    "DeCite 会把你与 AI 的对话保存到永久的公共记录中，并为你生成一个简短的引用代码——例如 DC-20260619-01——你可以把它写进论文、书籍或文章里。任何持有该代码的人之后都能查询并逐字读到这段对话，以及它被保存的日期和时间。它把一段可能消失的对话变成一个永远可以核查的来源。",
  "faq.q.who": "它适合谁使用？",
  "faq.a.who":
    "适合任何在与 AI 的对话中形成思考、并希望诚实标注来源的人——研究者、学生、作者、记者和教育工作者。作者用它来创建可引用的永久记录；读者、审稿人和编辑用它来核实 AI 究竟被问了什么、又回答了什么。",
  "faq.q.free": "真的免费吗？有什么附加条件吗？",
  "faq.a.free":
    "在我们上线推广期间，封存是免费的——无需账户、无需银行卡、没有隐藏步骤。保存并永久登记每段对话的费用由我们承担。如果将来有所变动，价格会在你封存任何内容之前清楚地显示出来，而且已经封存的对话将永远保持封存。",

  "faq.q.how": "我该如何封存一段对话？",
  "faq.a.how":
    "粘贴你的 AI 对话的公开分享链接，或者直接粘贴对话文本，再为它将被使用的地方加一个简短标题，然后点击“封存”。几秒钟内，DeCite 就会把对话保存到永久存档、为你预留引用代码，并将其记录到公共登记表中。你会立即看到引用；如果你填写了邮箱，我们也会把它发送给你。",
  "faq.q.linkVsPaste": "“官方分享链接”和“直接粘贴文本”有什么区别？",
  "faq.a.linkVsPaste":
    "当你的 AI 提供任何人都能打开的公开链接时，使用“官方分享链接”——DeCite 会从中读取对话并保存一份永久副本。当没有公开链接时，使用“直接粘贴文本”：你自己粘贴对话文本，DeCite 会原样保存你粘贴的内容。两者都会生成同样永久、可引用的记录。",
  "faq.q.platforms": "支持哪些 AI 平台？",
  "faq.a.platforms":
    "ChatGPT、Claude、Grok、Copilot、Perplexity、Poe、Mistral、Meta AI、Qwen 等平台的公开分享链接均可使用。对于不提供公开链接的任何 AI——或你更愿意粘贴的私密对话——请使用“直接粘贴文本”，它适用于任何工具，包括未列在此处的工具。",
  "faq.q.gemini": "Gemini 或 DeepSeek 不提供公开链接，我该怎么办？",
  "faq.a.gemini":
    "有些平台把对话保留在你的浏览器里，因此链接无法被外部读者打开。打开对话，全选并复制文本，然后切换到“直接粘贴文本”并粘贴。DeCite 会原样保存你粘贴的内容。你也可以在可选字段中填入原始对话链接，让你的引用记录下你使用的是哪个 AI。",
  "faq.q.account": "我需要账户、付款或加密钱包吗？",
  "faq.a.account":
    "不需要。无需注册、无需银行卡，也没有任何东西要安装。你不需要钱包或任何技术知识——DeCite 会在后台为你完成保存和登记。邮箱是可选的，仅用于把引用发送给你，并方便你日后再次找到它。",
  "faq.q.time": "封存需要多长时间？",
  "faq.a.time":
    "通常只需几秒钟。在它运行时请保持页面打开——DeCite 正在把对话保存到永久存档、预留你的代码，并将其记录到公共登记表中。完成后你会立即看到你的引用。",
  "faq.q.language": "我可以封存任何语言的对话吗？",
  "faq.a.language":
    "可以。DeCite 会以任何语言和文字原样保存对话文本。界面本身提供多种语言——你可以随时通过顶栏的语言菜单切换。",

  "faq.q.code": "引用代码长什么样？",
  "faq.a.code":
    "它是一个简短、清晰的代码，格式为 DC-YYYYMMDD-NN——例如 DC-20260619-01，表示 2026 年 6 月 19 日封存的第一段对话。它便于输入到参考文献中，也便于读者查询。",
  "faq.q.cite": "我该如何在论文或书籍中引用它？",
  "faq.a.cite":
    "当你封存一段对话时，DeCite 会提供一条现成的 APA 7 格式参考文献，你可以直接复制到参考文献列表中，同时还附有引用代码和公共记录链接。你可以自由地将其调整为你的期刊或出版社所要求的任何格式。",
  "faq.q.edit": "封存之后我可以编辑或更新对话吗？",
  "faq.a.edit":
    "不能——而这正是关键所在。已封存的对话任何人都无法更改，包括我们，正是这一点使它作为引用值得信赖。如果对话有了后续，或者你想保存更新的版本，只需再次封存即可获得一条单独的引用。",
  "faq.q.lost": "我弄丢了引用代码，怎样才能再次找到它？",
  "faq.a.lost":
    "如果你在封存时填写了邮箱，请进入“我的凭证”并输入同一个邮箱，即可看到与之关联的所有引用代码。如果你没有填写邮箱，就需要凭代码本身来查询对话——所以请把它妥善保存。",

  "faq.q.lookup": "别人如何查询我的引用？",
  "faq.a.lookup":
    "他们进入“查询”页面，输入引用代码，那段被封存的对话就会原样打开——完整文本、封存的日期和时间，以及所使用的 AI。阅读它无需账户或付款。",
  "faq.q.readerAccount": "读者或审稿人需要账户才能核验吗？",
  "faq.a.readerAccount":
    "不需要。任何持有代码的人都可以免费阅读对话，无需注册。由于记录同时存放在不受单一公司控制的独立公共基础设施上，认真的审稿人甚至完全不使用 DeCite 网站也能核验它。",

  "faq.q.where": "对话实际上存储在哪里？",
  "faq.a.where":
    "存放在两个不受任何单一公司控制的独立公共场所：一个保存完整对话的永久公共存档，以及一个记录其引用代码和封存时刻的公共登记表。DeCite 只是方便地查看两者的窗口——记录的存在并不依赖于我们。",
  "faq.q.ifGone": "如果 DeCite 有一天消失了会怎样？",
  "faq.a.ifGone":
    "你的引用依然有效。由于每条引用都存放在独立的公共基础设施上，任何人仍然可以直接打开公共登记表和永久存档——无需网站、无需账户，也无需任何许可。证据比公司更长久。",
  "faq.q.timestamp": "我怎么知道日期和时间是可信的？",
  "faq.a.timestamp":
    "当一段对话被封存时，确切的日期和时间会被写入一个事后无法被悄悄篡改的公共登记表。因此时间不仅仅是我们的一面之词——任何人都可以独立核查，这正是它经得起审视的原因。",

  "faq.q.public": "封存的对话是公开的吗？谁能看到？",
  "faq.a.public":
    "是的。封存的对话本就是为了可被引用，因此任何持有引用代码的人都能阅读它，并且它会永久公开。请只封存你愿意永久公开的对话。",
  "faq.q.sensitive": "对话中的个人或机密信息怎么办？",
  "faq.a.sensitive":
    "由于封存是永久且公开的，请在封存之前删除任何私密或敏感内容——姓名、联系方式、未发表的数据、任何机密信息。对话一旦封存就无法编辑或撤下，所以请先仔细检查文本。",
  "faq.q.email": "你们会存储我的邮箱吗？用来做什么？",
  "faq.a.email":
    "邮箱是可选的。如果你提供了邮箱，我们仅用它把引用发送给你，并让你能在“我的凭证”中再次找到你的代码。它不属于公共记录，我们也不会将其用于其他任何用途。",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "最新",
  "nav.more": "更多",
  "mint.share.label": "列入公开的「最新引用」列表",
  "mint.share.help":
    "默认开启。任何持有代码的人本就能读到已封存的引用；此选项只是将其公开列出，方便他人发现。关闭即可不在该列表中显示。",
  "latest.title": "最新引用",
  "latest.subtitle":
    "作者选择公开分享的近期封存对话。打开任意一条即可读到其背后的完整对话。",
  "latest.loading": "正在加载最新引用……",
  "latest.empty": "暂无公开引用——封存一条，它便可出现在这里。",
  "latest.notConfigured": "本站点尚未启用公开列表。",
  "latest.error": "暂时无法加载列表，请重试。",
  "latest.anon": "匿名",
  "latest.viewAll": "查看全部",
  "latest.sealCta": "封存对话",

  "footer.note": "永久 · 时间戳记 · 可独立核验",
  "common.user": "用户",
  "common.assistant": "助手",
};

// ─── हिन्दी (Hindi) ──────────────────────────────────────────────────────────
const hi: Dict = {
  "brand.tagline": "AI के साथ आपकी बातचीत के लिए स्थायी, सत्यापन-योग्य उद्धरण",
  "nav.home": "घोषणापत्र",
  "nav.mint": "संवाद सील करें",
  "nav.verify": "खोजें",
  "nav.receipts": "मेरी रसीदें",
  "nav.feedback": "प्रतिक्रिया",
  "nav.faq": "सामान्य प्रश्न",
  "nav.language": "भाषा",
  "cta.mint.title": "लेखकों के लिए",
  "cta.mint.desc": "AI के साथ हुई किसी बातचीत को स्थायी रूप से सहेजें और अपनी रचना में डालने योग्य उद्धरण पाएं।",
  "cta.mint.action": "उद्धरण बनाएं",
  "cta.verify.title": "पाठकों और समीक्षकों के लिए",
  "cta.verify.desc": "कोई भी उद्धरण कोड दर्ज करें और उससे जुड़ी ठीक वही बातचीत पढ़ें।",
  "cta.verify.action": "उद्धरण खोजें",
  "home.eyebrow": "AI के युग के लिए ईमानदार श्रेय",
  "home.hero.title": "AI ने आपको सोच पूरी करने में मदद की। अब उसे उद्धृत करें।",
  "home.hero.lede":
    "अधिकाधिक शोध AI के साथ बातचीत में आकार लेता है — पर वे बातचीत चुपचाप गायब हो जाती हैं, बदल दी जाती हैं, या बाद में सिद्ध नहीं हो पातीं। DeCite किसी बातचीत को स्थायी रूप से सहेजता है और आपको एक छोटा उद्धरण कोड देता है जिसे आप अपने शोध-पत्र या किताब में डाल सकते हैं। फिर कोई भी उसे खोजकर पढ़ सकता है कि ठीक क्या कहा गया और कब। न कोई खाता, न भुगतान, और सीखने को कुछ भी तकनीकी नहीं।",
  "home.crisis.title": "जब बातचीत गायब होती है, तो प्रमाण भी",
  "home.crisis.body":
    "साझा किया गया चैट लिंक बंद हो सकता है, और कोई मंच किसी भी समय बातचीत बदल या हटा सकता है। ऐसा होने पर समीक्षक यह नहीं जांच सकता कि क्या पूछा गया, AI ने क्या उत्तर दिया, या यह कब हुआ — और आपका श्रेय बस आपकी बात बनकर रह जाता है। DeCite बातचीत को स्थायी बना देता है, ताकि वह सदा ठीक वैसी ही पढ़ी जा सके, भले ही मूल मंच कब का जा चुका हो।",
  "home.pillars.permanence.title": "स्थायी",
  "home.pillars.permanence.body": "एक बार सहेजे जाने पर बातचीत न बदली जा सकती है, न चुपचाप हटाई — न हमारे द्वारा, न किसी और के।",
  "home.pillars.timestamp.title": "समय-अंकित",
  "home.pillars.timestamp.body": "हर उद्धरण सहेजे जाने की ठीक तारीख और समय दर्ज करता है, ताकि समय पर कभी विवाद न हो।",
  "home.pillars.citation.title": "उद्धृत करना आसान",
  "home.pillars.citation.body": "आपको DC-20260619-01 जैसा छोटा, साफ़ कोड मिलता है जिसे सीधे शोध-पत्र या किताब में डाला जा सकता है।",
  "home.quote": "उद्धरण एक वादा है कि स्रोत खोजा जा सकता है। हम बस वह वादा निभा रहे हैं।",
  "mint.title": "संवाद सील करें",
  "mint.subtitle": "बातचीत को स्थायी रूप से सहेजें और उद्धरण योग्य एक उद्धरण पाएं।",
  "mint.noWallet": "कुछ भी तकनीकी आवश्यक नहीं। DeCite आपकी ओर से बातचीत सहेजता और स्थायी रूप से दर्ज करता है — बस पेस्ट करें और सील दबाएं।",
  "mint.freeLaunch": "लॉन्च के दौरान निःशुल्क — न खाता, न कार्ड। DeCite आपकी बातचीत स्थायी रूप से सहेजता और दर्ज करता है। अपना ईमेल जोड़ें, हम आपको उद्धरण भेज देंगे।",
  "mint.tab.link": "आधिकारिक शेयर लिंक",
  "mint.tab.paste": "सीधा टेक्स्ट पेस्ट",
  "mint.link.label": "AI शेयर लिंक",
  "mint.link.help": "ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen आदि से आधिकारिक सार्वजनिक शेयर लिंक। कुछ मंच (जैसे Gemini, DeepSeek) बातचीत को बाहरी पाठकों से छिपाते हैं — उनके लिए सीधा टेक्स्ट पेस्ट उपयोग करें।",
  "mint.paste.label": "बातचीत का टेक्स्ट",
  "mint.paste.placeholder": "बातचीत यहाँ पेस्ट करें। हो सके तो हर बारी को 'User:' और 'Assistant:' से शुरू करें।",
  "mint.paste.help": "जब AI कोई सार्वजनिक शेयर लिंक न दे तब इसका उपयोग करें — जो आप पेस्ट करते हैं वही सहेजा जाता है।",
  "mint.originUrl.label": "मूल AI बातचीत का लिंक (वैकल्पिक)",
  "mint.originUrl.help": "मूल चैट का लिंक पेस्ट करें (कोई भी AI)। यह दर्ज करता है कि आपने कौन-सा AI इस्तेमाल किया और पाठकों को स्रोत खोलने देता है — जबकि ऊपर का टेक्स्ट ही सहेजा जाता है।",
  "mint.originUrl.detected": "पहचाना गया AI: {provider} — यह आपके उद्धरण के साथ दर्ज होगा।",
  "mint.sourceRef.label": "कहाँ उपयोग करेंगे (कृति का शीर्षक)",
  "mint.sourceRef.placeholder": "जैसे On the Ethics of Synthetic Reasoning (2026), अध्याय 3",
  "mint.author.label": "उद्धरण में आपका नाम (वैकल्पिक)",
  "mint.email.label": "ईमेल (वैकल्पिक)",
  "mint.email.help": "हम उद्धरण इस ईमेल पर भेजेंगे और ‘मेरी रसीदें’ में रखेंगे ताकि आप बाद में पा सकें।",
  "mint.step.pin": "बातचीत को स्थायी संग्रह में सहेजा जा रहा है",
  "mint.step.code": "आपका उद्धरण कोड आरक्षित किया जा रहा है",
  "mint.step.notarize": "इसे सार्वजनिक रजिस्ट्री में दर्ज किया जा रहा है",
  "mint.step.wait": "इसमें कुछ सेकंड लगते हैं — कृपया यह पृष्ठ खुला रखें।",
  "mint.action.seal": "सील करें और उद्धरण बनाएं",
  "mint.action.sealing": "सील किया जा रहा है…",
  "mint.action.sealFree": "निःशुल्क सील करें",
  "mint.action.pay": "${price} भुगतान करें और सील करें",
  "mint.action.preparing": "सुरक्षित चेकआउट तैयार किया जा रहा है…",
  "mint.pay.note": "एक बार का ${price} शुल्क आपकी बातचीत सहेजने और स्थायी रूप से दर्ज करने को कवर करता है। भुगतान Stripe द्वारा सुरक्षित रूप से संभाला जाता है — हम आपके कार्ड विवरण कभी नहीं देखते या संग्रहीत नहीं करते।",
  "mint.canceled": "चेकआउट रद्द कर दिया गया। आपकी बातचीत सहेजी नहीं गई।",
  "mint.success.title": "सहेजा और दर्ज किया गया",
  "mint.success.desc": "आपकी बातचीत अब स्थायी है। अपनी ग्रंथसूची के लिए नीचे दिया उद्धरण कॉपी करें।",
  "mint.success.code": "उद्धरण कोड",
  "mint.success.tx": "सार्वजनिक रिकॉर्ड",
  "mint.success.apa": "उद्धरण (APA शैली)",
  "mint.success.custodian": "DeCite द्वारा आपकी ओर से स्थायी रूप से दर्ज",
  "mint.copy": "कॉपी करें",
  "mint.copied": "कॉपी हो गया",
  "mint.viewVerify": "उद्धरण पृष्ठ खोलें",
  "mint.error.badLink": "एक मान्य सार्वजनिक AI शेयर लिंक दर्ज करें (ChatGPT, Claude, Grok, Perplexity आदि)।",
  "mint.pasteOnlyHint": "{provider} बातचीत को आपके ब्राउज़र के भीतर रखता है, इसलिए इसे लिंक से नहीं पढ़ा जा सकता। अपनी {provider} चैट खोलें, सब चुनें और कॉपी करें, फिर यहाँ पेस्ट करें — जो आप पेस्ट करते हैं वही DeCite सहेजता है।",
  "mint.switchToPaste": "सीधा टेक्स्ट पेस्ट उपयोग करें",
  "mint.error.empty": "कृपया बातचीत जोड़ें।",
  "mint.error.sourceRef": "कृपया बताएं कि कहाँ उपयोग करेंगे।",
  "mint.warn.noContract": "यह साइट अभी सीलिंग के लिए पूरी तरह सेट नहीं है।",
  "verify.title": "उद्धरण खोजें",
  "verify.subtitle": "उद्धरण कोड दर्ज करें और उसके पीछे की ठीक बातचीत पढ़ें।",
  "verify.input.placeholder": "उद्धरण कोड दर्ज करें, जैसे DC-20260619-01",
  "verify.action": "खोजें",
  "verify.error.format": "यह एक मान्य उद्धरण कोड नहीं लगता (DC-YYYYMMDD-NN)।",
  "verify.error.notFound": "इस कोड के लिए कोई उद्धरण नहीं मिला।",
  "verify.error.config": "इस साइट पर खोज अभी सेट नहीं है।",
  "verify.loading": "उद्धरण खोजा जा रहा है…",
  "verify.sealed": "सील और सत्यापित",
  "verify.meta.title": "उद्धरण विवरण",
  "verify.meta.timestamp": "सील की तारीख",
  "verify.meta.ai": "AI / मॉडल",
  "verify.cite.title": "उद्धरण के लिए तैयार",
  "verify.cite.help": "इस संदर्भ को सीधे अपने शोध-पत्र या किताब की ग्रंथसूची में कॉपी करें (APA 7 शैली)।",
  "verify.meta.authorName": "लेखक",
  "verify.meta.custodian": "सील करने वाला",
  "verify.meta.registry": "सार्वजनिक रजिस्ट्री",
  "verify.meta.origin": "कैसे जोड़ा गया",
  "verify.meta.cid": "संग्रह आईडी",
  "verify.meta.code": "उद्धरण कोड",
  "verify.origin.link": "मूल AI बातचीत",
  "verify.origin.open": "मूल खोलें (बाहरी साइट)",
  "verify.origin.warn": "बाहरी लिंक — मूल मंच ने इस बातचीत को बदला या हटाया हो सकता है।",
  "verify.ipfs.title": "स्थायी संग्रह",
  "verify.ipfs.desc": "सीधे स्थायी सार्वजनिक संग्रह से पढ़ें — मूल बातचीत हटने पर भी उपलब्ध।",
  "verify.ipfs.open": "सहेजी गई फ़ाइल खोलें",
  "verify.role.user": "उपयोगकर्ता",
  "verify.role.assistant": "सहायक",
  "verify.back": "दूसरा कोड खोजें",
  "verify.perm.title": "हमेशा सुलभ — DeCite के बिना भी",
  "verify.perm.body": "यह उद्धरण दो स्वतंत्र सार्वजनिक स्थानों पर रखा जाता है जिन्हें कोई एक कंपनी नियंत्रित नहीं करती: एक स्थायी सार्वजनिक रजिस्ट्री और एक स्थायी सार्वजनिक संग्रह। कोई भी इनमें से किसी एक को सीधे, हमेशा के लिए खोल सकता है — भले ही DeCite वेबसाइट कभी न रहे। नीचे हमारे बिना इसी रिकॉर्ड तक पहुँचने के दोनों तरीके हैं।",
  "verify.perm.chain": "सार्वजनिक रजिस्ट्री",
  "verify.perm.callHint": "सार्वजनिक रजिस्ट्री में अपना कोड {code} खोजें:",
  "verify.perm.readOn": "सार्वजनिक रजिस्ट्री खोलें",
  "verify.perm.ipfs": "स्थायी संग्रह",
  "verify.perm.ipfsHint": "इस संग्रह के किसी भी सार्वजनिक मिरर से सहेजी गई बातचीत खोलें:",
  "verify.perm.note": "DeCite तो बस यह सब पढ़ने का सुविधाजनक तरीका है। उद्धरण स्वयं स्वतंत्र सार्वजनिक ढांचे पर रहता है और हमारे बिना भी बना रहता है।",
  "home.independent.title": "आपके उद्धरण हम पर निर्भर नहीं हैं",
  "home.independent.body": "हर उद्धरण दो स्वतंत्र सार्वजनिक स्थानों पर सहेजा जाता है जिन्हें कोई एक कंपनी नियंत्रित नहीं करती। यदि DeCite कभी न रहे, तो भी आपके संदर्भ स्वयं स्थायी रूप से पठनीय और सत्यापन-योग्य रहते हैं — न वेबसाइट, न खाता, न अनुमति।",
  "home.independent.viewRegistry": "सार्वजनिक रजिस्ट्री देखें",
  "success.error.title": "हम आपकी बातचीत की सीलिंग पूरी नहीं कर सके",
  "success.retry": "सीलिंग पर वापस",
  "success.sealAnother": "एक और बातचीत सील करें",
  "receipts.title": "मेरी रसीदें",
  "receipts.subtitle": "अपने उद्धरण कोड खोजने के लिए वही ईमेल दर्ज करें जो सील करते समय उपयोग किया था।",
  "receipts.action": "खोजें",
  "receipts.empty": "इस ईमेल के लिए अभी तक कोई उद्धरण नहीं मिला।",
  "receipts.notConfigured": "इस साइट पर सहेजी गई रसीदें अभी उपलब्ध नहीं हैं।",
  "feedback.title": "प्रतिक्रिया और सुझाव",
  "feedback.subtitle": "बताएं क्या बेहतर करें, कोई समस्या बताएं, या कोई विचार साझा करें। हम सब कुछ पढ़ते हैं।",
  "feedback.type.label": "किस प्रकार की प्रतिक्रिया?",
  "feedback.type.suggestion": "सुझाव",
  "feedback.type.bug": "समस्या",
  "feedback.type.praise": "प्रशंसा",
  "feedback.type.other": "अन्य",
  "feedback.message.label": "आपका संदेश",
  "feedback.message.placeholder": "आपके मन में क्या है? जितना विशिष्ट, उतना बेहतर।",
  "feedback.email.label": "ईमेल (वैकल्पिक)",
  "feedback.email.help": "केवल तभी जब आप उत्तर चाहते हों। हम इसका अन्य कोई उपयोग नहीं करेंगे।",
  "feedback.submit": "प्रतिक्रिया भेजें",
  "feedback.sending": "भेजा जा रहा है…",
  "feedback.error.empty": "कृपया एक संदेश दर्ज करें।",
  "feedback.error.generic": "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
  "feedback.thanks.title": "धन्यवाद!",
  "feedback.thanks.body": "आपकी प्रतिक्रिया मिल गई। यह वास्तव में DeCite को आकार देने में मदद करती है।",
  "feedback.thanks.again": "और प्रतिक्रिया भेजें",
  "feedback.thanks.home": "होम पर वापस",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "सामान्य प्रश्न",
  "faq.subtitle":
    "AI के साथ हुई बातचीत को सील करने, उसका उद्धरण देने, और प्रमाण को हमेशा पठनीय बनाए रखने के बारे में सब कुछ। अपना प्रश्न नहीं मिला? उसे ‘प्रतिक्रिया’ के ज़रिए भेजें — हम हर प्रश्न का उत्तर देते हैं।",
  "faq.group.about": "DeCite के बारे में",
  "faq.group.sealing": "बातचीत सील करना",
  "faq.group.citation": "आपका उद्धरण",
  "faq.group.readers": "पाठकों और समीक्षकों के लिए",
  "faq.group.trust": "स्थायित्व और विश्वसनीयता",
  "faq.group.privacy": "गोपनीयता और सुरक्षा",
  "faq.stillTitle": "अब भी कोई प्रश्न है?",
  "faq.stillBody":
    "अगर यहाँ किसी बात का उत्तर नहीं मिला, तो हमसे सीधे पूछें — हम हर संदेश पढ़ते हैं और आमतौर पर एक दिन के भीतर जवाब देते हैं।",
  "faq.stillCta": "प्रश्न पूछें",
  "faq.sealCta": "बातचीत सील करें",

  "faq.q.what": "DeCite क्या है?",
  "faq.a.what":
    "DeCite आपकी AI के साथ हुई बातचीत को एक स्थायी सार्वजनिक रिकॉर्ड में सहेजता है और आपको एक छोटा उद्धरण कोड देता है — जैसे DC-20260619-01 — जिसे आप अपने शोधपत्र, पुस्तक या लेख में डाल सकते हैं। जिसके पास यह कोड हो, वह बाद में उसे खोजकर ठीक वही बातचीत शब्दशः पढ़ सकता है, साथ ही वह तारीख और समय भी जब उसे सहेजा गया था। यह एक ऐसी बातचीत को, जो गायब हो सकती थी, एक ऐसे स्रोत में बदल देता है जिसे हमेशा जाँचा जा सकता है।",
  "faq.q.who": "यह किसके लिए है?",
  "faq.a.who":
    "हर उस व्यक्ति के लिए जिसकी सोच AI के साथ बातचीत में आकार लेती है और जो उसका ईमानदारी से श्रेय देना चाहता है — शोधकर्ता, छात्र, लेखक, पत्रकार और शिक्षक। लेखक इसका उपयोग एक उद्धरण-योग्य, स्थायी रिकॉर्ड बनाने के लिए करते हैं; पाठक, समीक्षक और संपादक इसका उपयोग यह सत्यापित करने के लिए करते हैं कि AI से ठीक क्या पूछा गया और उसने क्या उत्तर दिया।",
  "faq.q.free": "क्या यह सचमुच मुफ़्त है? कोई छिपी शर्त तो नहीं?",
  "faq.a.free":
    "लॉन्च के दौरान सील करना मुफ़्त है — न कोई खाता, न कार्ड, न कोई छिपा हुआ चरण। हर बातचीत को सहेजने और स्थायी रूप से दर्ज करने का खर्च हम वहन करते हैं। अगर यह कभी बदलता है, तो कुछ भी सील करने से पहले कीमत स्पष्ट रूप से दिखाई जाएगी, और जो बातचीतें पहले ही सील हो चुकी हैं वे हमेशा सील रहेंगी।",

  "faq.q.how": "मैं बातचीत कैसे सील करूँ?",
  "faq.a.how":
    "अपनी AI बातचीत का कोई सार्वजनिक शेयर लिंक या बातचीत का टेक्स्ट चिपकाएँ, जहाँ आप उसका उपयोग करेंगे उसके लिए एक छोटा शीर्षक जोड़ें, और ‘सील करें’ पर क्लिक करें। कुछ ही सेकंड में DeCite बातचीत को स्थायी संग्रह में सहेज देता है, आपका उद्धरण कोड आरक्षित कर देता है, और उसे सार्वजनिक रजिस्ट्री में दर्ज कर देता है। उद्धरण आपको तुरंत दिख जाएगा, और यदि आप अपना पता जोड़ते हैं तो हम उसे आपको ईमेल कर देंगे।",
  "faq.q.linkVsPaste": "‘आधिकारिक शेयर लिंक’ और ‘सीधा टेक्स्ट पेस्ट’ में क्या अंतर है?",
  "faq.a.linkVsPaste":
    "‘आधिकारिक शेयर लिंक’ का उपयोग तब करें जब आपका AI ऐसा सार्वजनिक लिंक दे जिसे कोई भी खोल सके — DeCite उससे बातचीत पढ़कर एक स्थायी प्रति सहेज लेता है। ‘सीधा टेक्स्ट पेस्ट’ का उपयोग तब करें जब कोई सार्वजनिक लिंक न हो: आप खुद बातचीत का टेक्स्ट चिपकाते हैं और DeCite ठीक वही सहेजता है जो आपने चिपकाया। दोनों ही एक जैसा स्थायी, उद्धरण-योग्य रिकॉर्ड बनाते हैं।",
  "faq.q.platforms": "कौन-से AI प्लेटफ़ॉर्म समर्थित हैं?",
  "faq.a.platforms":
    "ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen और अन्य के सार्वजनिक शेयर लिंक काम करते हैं। किसी भी ऐसे AI के लिए जो सार्वजनिक लिंक नहीं देता — या किसी निजी बातचीत के लिए जिसे आप चिपकाना पसंद करें — ‘सीधा टेक्स्ट पेस्ट’ का उपयोग करें, जो किसी भी टूल के साथ काम करता है, इस सूची में न होने वाले टूल सहित।",
  "faq.q.gemini": "Gemini या DeepSeek मुझे सार्वजनिक लिंक नहीं देते। मैं क्या करूँ?",
  "faq.a.gemini":
    "कुछ प्लेटफ़ॉर्म बातचीत को आपके ब्राउज़र के भीतर ही रखते हैं, इसलिए कोई लिंक बाहरी पाठक नहीं पढ़ सकते। बातचीत खोलें, टेक्स्ट चुनकर कॉपी करें, फिर ‘सीधा टेक्स्ट पेस्ट’ पर जाकर उसे चिपकाएँ। DeCite ठीक वही सहेजता है जो आपने चिपकाया। आप वैकल्पिक फ़ील्ड में मूल बातचीत का लिंक भी जोड़ सकते हैं ताकि आपका उद्धरण यह दर्ज कर ले कि आपने कौन-सा AI इस्तेमाल किया।",
  "faq.q.account": "क्या मुझे खाता, भुगतान या क्रिप्टो वॉलेट चाहिए?",
  "faq.a.account":
    "नहीं। कोई साइन-अप नहीं, कोई कार्ड नहीं, और इंस्टॉल करने को कुछ नहीं। आपको वॉलेट या किसी तकनीकी जानकारी की ज़रूरत नहीं — DeCite पर्दे के पीछे आपके लिए सहेजने और दर्ज करने का काम संभाल लेता है। ईमेल वैकल्पिक है, और केवल आपको उद्धरण भेजने तथा बाद में उसे दोबारा ढूँढ़ने देने के लिए उपयोग होता है।",
  "faq.q.time": "सील करने में कितना समय लगता है?",
  "faq.a.time":
    "आमतौर पर बस कुछ सेकंड। जब तक यह चल रहा हो पृष्ठ खुला रखें — DeCite बातचीत को स्थायी संग्रह में सहेज रहा है, आपका कोड आरक्षित कर रहा है, और उसे सार्वजनिक रजिस्ट्री में दर्ज कर रहा है। पूरा होते ही आपको अपना उद्धरण तुरंत दिख जाएगा।",
  "faq.q.language": "क्या मैं किसी भी भाषा की बातचीत सील कर सकता हूँ?",
  "faq.a.language":
    "हाँ। DeCite बातचीत के टेक्स्ट को किसी भी भाषा और लिपि में ठीक वैसे ही सहेजता है जैसा वह है। इंटरफ़ेस स्वयं कई भाषाओं में उपलब्ध है — आप इसे ऊपरी पट्टी के भाषा मेन्यू से कभी भी बदल सकते हैं।",

  "faq.q.code": "उद्धरण कोड कैसा दिखता है?",
  "faq.a.code":
    "यह DC-YYYYMMDD-NN रूप का एक छोटा, साफ़ कोड है — उदाहरण के लिए DC-20260619-01, जिसका अर्थ है 19 जून 2026 को सील की गई पहली बातचीत। इसे संदर्भ-सूची में टाइप करना आसान है और पाठक के लिए खोजना भी आसान है।",
  "faq.q.cite": "मैं इसे अपने शोधपत्र या पुस्तक में कैसे उद्धृत करूँ?",
  "faq.a.cite":
    "जब आप कोई बातचीत सील करते हैं, तो DeCite आपको APA 7 शैली में एक तैयार संदर्भ देता है जिसे आप सीधे अपनी संदर्भ-सूची में कॉपी कर सकते हैं, साथ में उद्धरण कोड और सार्वजनिक-रिकॉर्ड लिंक भी। आप इसे अपने जर्नल या प्रकाशक की ज़रूरत के अनुसार किसी भी शैली में ढाल सकते हैं।",
  "faq.q.edit": "सील करने के बाद क्या मैं बातचीत संपादित या अपडेट कर सकता हूँ?",
  "faq.a.edit":
    "नहीं — और यही पूरी बात है। एक सील की गई बातचीत को कोई नहीं बदल सकता, हम भी नहीं, और यही उसे उद्धरण के रूप में भरोसेमंद बनाता है। अगर बातचीत आगे बढ़ी या आप कोई नया संस्करण सहेजना चाहते हैं, तो बस उसे फिर से सील कर दें और एक अलग उद्धरण पा लें।",
  "faq.q.lost": "मेरा उद्धरण कोड खो गया। मैं उसे दोबारा कैसे पाऊँ?",
  "faq.a.lost":
    "अगर आपने सील करते समय अपना ईमेल जोड़ा था, तो ‘मेरी रसीदें’ पर जाकर वही ईमेल डालें और उससे जुड़े सभी उद्धरण कोड देख लें। अगर आपने ईमेल नहीं जोड़ा था, तो बातचीत खोजने के लिए आपको कोड की ही ज़रूरत होगी — इसलिए उसे कहीं सुरक्षित रखें।",

  "faq.q.lookup": "कोई मेरा उद्धरण कैसे खोजता है?",
  "faq.a.lookup":
    "वे ‘खोजें’ पृष्ठ पर जाते हैं, उद्धरण कोड टाइप करते हैं, और ठीक वही सील की गई बातचीत खुल जाती है — पूरा टेक्स्ट, सील किए जाने की तारीख और समय, और कौन-सा AI इस्तेमाल हुआ। इसे पढ़ने के लिए किसी खाते या भुगतान की ज़रूरत नहीं।",
  "faq.q.readerAccount": "क्या सत्यापन के लिए पाठकों या समीक्षकों को खाता चाहिए?",
  "faq.a.readerAccount":
    "नहीं। जिसके पास कोड हो, वह बातचीत मुफ़्त में, बिना साइन-अप के पढ़ सकता है। चूँकि रिकॉर्ड किसी एक कंपनी के नियंत्रण से बाहर स्वतंत्र सार्वजनिक अवसंरचना पर भी रहता है, एक गंभीर समीक्षक उसे DeCite वेबसाइट का उपयोग किए बिना भी सत्यापित कर सकता है।",

  "faq.q.where": "बातचीत वास्तव में कहाँ संग्रहीत होती है?",
  "faq.a.where":
    "दो स्वतंत्र सार्वजनिक स्थानों में जिन्हें कोई एक कंपनी नियंत्रित नहीं करती: एक स्थायी सार्वजनिक संग्रह जो पूरी बातचीत रखता है, और एक सार्वजनिक रजिस्ट्री जो उसका उद्धरण कोड और सील किए जाने का क्षण दर्ज करती है। DeCite बस दोनों को देखने की एक सुविधाजनक खिड़की है — रिकॉर्ड के अस्तित्व के लिए हम पर निर्भरता नहीं है।",
  "faq.q.ifGone": "अगर DeCite कभी गायब हो जाए तो क्या होगा?",
  "faq.a.ifGone":
    "आपके उद्धरण काम करते रहेंगे। चूँकि हर उद्धरण स्वतंत्र सार्वजनिक अवसंरचना पर संग्रहीत है, कोई भी अब भी सार्वजनिक रजिस्ट्री और स्थायी संग्रह को सीधे खोल सकता है — न वेबसाइट, न खाता, न किसी अनुमति की ज़रूरत। प्रमाण कंपनी से अधिक टिकाऊ है।",
  "faq.q.timestamp": "मुझे कैसे पता चले कि तारीख और समय पर भरोसा किया जा सकता है?",
  "faq.a.timestamp":
    "जब कोई बातचीत सील होती है, तो उसकी ठीक तारीख और समय एक सार्वजनिक रजिस्ट्री में लिख दिए जाते हैं जिन्हें बाद में चुपचाप बदला नहीं जा सकता। इसलिए समय केवल हमारी बात नहीं है — कोई भी उसे स्वतंत्र रूप से जाँच सकता है, और यही उसे परखने पर टिका रहने योग्य बनाता है।",

  "faq.q.public": "क्या सील की गई बातचीत सार्वजनिक होती है? उसे कौन देख सकता है?",
  "faq.a.public":
    "हाँ। सील की गई बातचीत का उद्देश्य ही उद्धरण-योग्य होना है, इसलिए जिसके पास उद्धरण कोड हो वह उसे पढ़ सकता है, और वह स्थायी रूप से सार्वजनिक रहती है। केवल वही बातचीतें सील करें जिन्हें आप हमेशा के लिए सार्वजनिक करने में सहज हों।",
  "faq.q.sensitive": "बातचीत में मौजूद निजी या गोपनीय जानकारी का क्या?",
  "faq.a.sensitive":
    "चूँकि सील करना स्थायी और सार्वजनिक है, सील करने से पहले कोई भी निजी या संवेदनशील चीज़ हटा दें — नाम, संपर्क विवरण, अप्रकाशित डेटा, कोई भी गोपनीय बात। एक बार सील होने के बाद बातचीत न संपादित की जा सकती है न हटाई जा सकती है, इसलिए पहले टेक्स्ट को ध्यान से जाँच लें।",
  "faq.q.email": "क्या आप मेरा ईमेल संग्रहीत करते हैं, और किसलिए?",
  "faq.a.email":
    "ईमेल वैकल्पिक है। यदि आप एक देते हैं, तो हम उसका उपयोग केवल आपको आपका उद्धरण भेजने और ‘मेरी रसीदें’ में आपके कोड दोबारा खोजने देने के लिए करते हैं। यह सार्वजनिक रिकॉर्ड का हिस्सा नहीं है और हम उसका किसी और चीज़ के लिए उपयोग नहीं करते।",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "नवीनतम",
  "nav.more": "और",
  "mint.share.label": "सार्वजनिक ‘नवीनतम उद्धरण’ सूची में शामिल करें",
  "mint.share.help":
    "डिफ़ॉल्ट रूप से चालू। कोड रखने वाला कोई भी व्यक्ति पहले से ही सील उद्धरण पढ़ सकता है; यह बस उसे सार्वजनिक रूप से सूचीबद्ध करता है ताकि दूसरे उसे खोज सकें। सूची से बाहर रखने के लिए इसे बंद कर दें।",
  "latest.title": "नवीनतम उद्धरण",
  "latest.subtitle":
    "हाल ही में सील की गई बातचीतें जिन्हें लेखकों ने सार्वजनिक रूप से साझा करना चुना। पीछे की सटीक बातचीत पढ़ने के लिए किसी को भी खोलें।",
  "latest.loading": "नवीनतम उद्धरण लोड हो रहे हैं…",
  "latest.empty": "अभी कोई सार्वजनिक उद्धरण नहीं — एक सील करें और वह यहाँ दिख सकता है।",
  "latest.notConfigured": "इस साइट पर सार्वजनिक सूची अभी उपलब्ध नहीं है।",
  "latest.error": "सूची अभी लोड नहीं हो सकी। कृपया फिर से प्रयास करें।",
  "latest.anon": "गुमनाम",
  "latest.viewAll": "सभी देखें",
  "latest.sealCta": "बातचीत सील करें",

  "footer.note": "स्थायी · समय-अंकित · स्वतंत्र रूप से सत्यापन-योग्य",
  "common.user": "उपयोगकर्ता",
  "common.assistant": "सहायक",
};

// ─── Español ─────────────────────────────────────────────────────────────────
const es: Dict = {
  "brand.tagline": "Citas permanentes y verificables para tus conversaciones con AI",
  "nav.home": "Manifiesto",
  "nav.mint": "Sellar diálogo",
  "nav.verify": "Buscar",
  "nav.receipts": "Mis recibos",
  "nav.feedback": "Sugerencias",
  "nav.faq": "Preguntas frecuentes",
  "nav.language": "Idioma",
  "cta.mint.title": "Para autores",
  "cta.mint.desc": "Guarda para siempre una conversación que tuviste con una AI y obtén una cita para usar en tu trabajo.",
  "cta.mint.action": "Crear una cita",
  "cta.verify.title": "Para lectores y revisores",
  "cta.verify.desc": "Introduce cualquier código de cita y lee la conversación exacta a la que se refiere.",
  "cta.verify.action": "Buscar una cita",
  "home.eyebrow": "Atribución honesta para la era de la AI",
  "home.hero.title": "La AI te ayudó a pensarlo a fondo. Ahora cítala.",
  "home.hero.lede":
    "Cada vez más investigación toma forma conversando con una AI, pero esas conversaciones desaparecen sin más, se editan o luego no se pueden demostrar. DeCite guarda una conversación para siempre y te da un código de cita corto para tu artículo o libro. Cualquiera puede luego buscarlo y leer exactamente qué se dijo, y cuándo. Sin cuenta, sin pago y sin nada técnico que aprender.",
  "home.crisis.title": "Cuando la conversación desaparece, también la prueba",
  "home.crisis.body":
    "Un enlace de chat compartido puede dejar de funcionar, y una plataforma puede editar o borrar una conversación en cualquier momento. Cuando eso ocurre, un revisor ya no puede comprobar qué se preguntó, qué respondió la AI o cuándo pasó, y tu atribución queda en tu palabra. DeCite hace la conversación permanente, para que siempre pueda leerse tal como fue, aunque la plataforma original haya desaparecido hace tiempo.",
  "home.pillars.permanence.title": "Permanente",
  "home.pillars.permanence.body": "Una vez guardada, la conversación no se puede editar ni retirar en silencio, ni por nosotros ni por nadie.",
  "home.pillars.timestamp.title": "Con fecha y hora",
  "home.pillars.timestamp.body": "Cada cita registra la fecha y hora exactas en que se guardó, así el momento nunca se puede discutir.",
  "home.pillars.citation.title": "Fácil de citar",
  "home.pillars.citation.body": "Obtienes un código corto y limpio como DC-20260619-01 para poner directo en un artículo o libro.",
  "home.quote": "Una cita es la promesa de que la fuente puede encontrarse. Solo cumplimos la promesa.",
  "mint.title": "Sellar un diálogo",
  "mint.subtitle": "Guarda la conversación para siempre y obtén una cita que puedas usar.",
  "mint.noWallet": "Nada técnico. DeCite guarda y registra permanentemente la conversación por ti: solo pégala y pulsa Sellar.",
  "mint.freeLaunch": "Gratis durante el lanzamiento: sin cuenta, sin tarjeta. DeCite guarda y registra tu conversación para siempre. Añade tu correo y te enviamos la cita.",
  "mint.tab.link": "Enlace oficial",
  "mint.tab.paste": "Pegar texto directo",
  "mint.link.label": "Enlace de la AI",
  "mint.link.help": "Un enlace público oficial de ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen y más. Algunas plataformas (p. ej. Gemini, DeepSeek) ocultan el chat a lectores externos: usa Pegar texto directo para esas.",
  "mint.paste.label": "Texto de la conversación",
  "mint.paste.placeholder": "Pega aquí la conversación. Si puedes, empieza cada turno con 'User:' y 'Assistant:'.",
  "mint.paste.help": "Úsalo cuando la AI no ofrezca un enlace público: guarda exactamente lo que pegas.",
  "mint.originUrl.label": "Enlace a la conversación original con la AI (opcional)",
  "mint.originUrl.help": "Pega el enlace al chat original (cualquier AI). Registra qué AI usaste y permite a los lectores abrir la fuente, mientras que el texto de arriba es lo que se guarda.",
  "mint.originUrl.detected": "AI detectada: {provider} — se registrará con tu cita.",
  "mint.sourceRef.label": "Dónde lo usarás (título de la obra)",
  "mint.sourceRef.placeholder": "p. ej. Sobre la ética del razonamiento sintético (2026), cap. 3",
  "mint.author.label": "Tu nombre para la cita (opcional)",
  "mint.email.label": "Correo (opcional)",
  "mint.email.help": "Te enviaremos la cita a este correo y la guardaremos en Mis recibos para que la encuentres luego.",
  "mint.step.pin": "Guardando la conversación en un archivo permanente",
  "mint.step.code": "Reservando tu código de cita",
  "mint.step.notarize": "Registrándola en el registro público",
  "mint.step.wait": "Esto tarda unos segundos: por favor no cierres la página.",
  "mint.action.seal": "Sellar y crear cita",
  "mint.action.sealing": "Sellando…",
  "mint.action.sealFree": "Sellar gratis",
  "mint.action.pay": "Pagar ${price} y sellar",
  "mint.action.preparing": "Preparando el pago seguro…",
  "mint.pay.note": "Una tarifa única de ${price} cubre guardar y registrar permanentemente tu conversación. El pago lo gestiona Stripe de forma segura: nunca vemos ni guardamos los datos de tu tarjeta.",
  "mint.canceled": "Pago cancelado. Tu conversación no se guardó.",
  "mint.success.title": "Guardado y registrado",
  "mint.success.desc": "Tu conversación ahora es permanente. Copia la cita de abajo para tu bibliografía.",
  "mint.success.code": "Código de cita",
  "mint.success.tx": "Registro público",
  "mint.success.apa": "Cita (estilo APA)",
  "mint.success.custodian": "Registrado permanentemente por DeCite en tu nombre",
  "mint.copy": "Copiar",
  "mint.copied": "Copiado",
  "mint.viewVerify": "Abrir la página de la cita",
  "mint.error.badLink": "Introduce un enlace público válido de una AI (ChatGPT, Claude, Grok, Perplexity y más).",
  "mint.pasteOnlyHint": "{provider} mantiene la conversación dentro de tu navegador, así que no puede leerse desde un enlace. Abre tu chat de {provider}, selecciona todo y cópialo, luego pégalo aquí: DeCite guarda exactamente lo que pegas.",
  "mint.switchToPaste": "Usar Pegar texto directo",
  "mint.error.empty": "Añade la conversación, por favor.",
  "mint.error.sourceRef": "Indica dónde la usarás, por favor.",
  "mint.warn.noContract": "Este sitio aún no está listo para sellar.",
  "verify.title": "Buscar una cita",
  "verify.subtitle": "Introduce un código de cita y lee la conversación exacta que hay detrás.",
  "verify.input.placeholder": "Introduce un código, p. ej. DC-20260619-01",
  "verify.action": "Buscar",
  "verify.error.format": "Eso no parece un código de cita válido (DC-AAAAMMDD-NN).",
  "verify.error.notFound": "No se encontró ninguna cita para este código.",
  "verify.error.config": "La búsqueda aún no está configurada en este sitio.",
  "verify.loading": "Buscando la cita…",
  "verify.sealed": "SELLADO Y VERIFICADO",
  "verify.meta.title": "Detalles de la cita",
  "verify.meta.timestamp": "Fecha de sellado",
  "verify.meta.ai": "AI / Modelo",
  "verify.cite.title": "Lista para citar",
  "verify.cite.help": "Copia esta referencia directo en la bibliografía de tu artículo o libro (estilo APA 7).",
  "verify.meta.authorName": "Autor",
  "verify.meta.custodian": "Sellado por",
  "verify.meta.registry": "Registro público",
  "verify.meta.origin": "Cómo se añadió",
  "verify.meta.cid": "ID del archivo",
  "verify.meta.code": "Código de cita",
  "verify.origin.link": "La conversación original con la AI",
  "verify.origin.open": "Abrir el original (sitio externo)",
  "verify.origin.warn": "Enlace externo: la plataforma original puede haber cambiado o eliminado esta conversación.",
  "verify.ipfs.title": "Archivo permanente",
  "verify.ipfs.desc": "Léelo directo del archivo público permanente: disponible aunque se borre la conversación original.",
  "verify.ipfs.open": "Abrir el archivo guardado",
  "verify.role.user": "Usuario",
  "verify.role.assistant": "Asistente",
  "verify.back": "Buscar otro código",
  "verify.perm.title": "Siempre accesible, incluso sin DeCite",
  "verify.perm.body": "Esta cita se guarda en dos lugares públicos independientes que ninguna empresa controla: un registro público permanente y un archivo público permanente. Cualquiera puede abrir uno u otro directamente, para siempre, aunque el sitio de DeCite llegue a desaparecer. Aquí están las dos formas de llegar a este mismo registro sin nosotros.",
  "verify.perm.chain": "El registro público",
  "verify.perm.callHint": "Busca tu código, {code}, en el registro público:",
  "verify.perm.readOn": "Abrir el registro público",
  "verify.perm.ipfs": "El archivo permanente",
  "verify.perm.ipfsHint": "Abre la conversación guardada desde cualquier copia pública del archivo:",
  "verify.perm.note": "DeCite es solo una forma cómoda de leer todo esto. La cita en sí vive en infraestructura pública independiente y perdura sin nosotros.",
  "home.independent.title": "Tus citas no dependen de nosotros",
  "home.independent.body": "Cada cita se guarda en dos lugares públicos independientes que ninguna empresa controla. Si DeCite desapareciera, tus referencias seguirían siendo legibles y verificables por sí solas, para siempre: sin web, sin cuenta y sin permisos.",
  "home.independent.viewRegistry": "Ver el registro público",
  "success.error.title": "No pudimos terminar de sellar tu conversación",
  "success.retry": "Volver a sellar",
  "success.sealAnother": "Sellar otra conversación",
  "receipts.title": "Mis recibos",
  "receipts.subtitle": "Introduce el correo que usaste al sellar para encontrar tus códigos de cita.",
  "receipts.action": "Buscar",
  "receipts.empty": "Aún no se encontraron citas para este correo.",
  "receipts.notConfigured": "Los recibos guardados aún no están disponibles en este sitio.",
  "feedback.title": "Comentarios y sugerencias",
  "feedback.subtitle": "Dinos qué mejorar, reporta un problema o comparte una idea. Leemos todo.",
  "feedback.type.label": "¿Qué tipo de comentario?",
  "feedback.type.suggestion": "Sugerencia",
  "feedback.type.bug": "Problema",
  "feedback.type.praise": "Elogio",
  "feedback.type.other": "Otro",
  "feedback.message.label": "Tu mensaje",
  "feedback.message.placeholder": "¿Qué tienes en mente? Cuanto más específico, mejor.",
  "feedback.email.label": "Correo (opcional)",
  "feedback.email.help": "Solo si quieres respuesta. No lo usaremos para nada más.",
  "feedback.submit": "Enviar comentarios",
  "feedback.sending": "Enviando…",
  "feedback.error.empty": "Escribe un mensaje.",
  "feedback.error.generic": "Algo salió mal. Inténtalo de nuevo.",
  "feedback.thanks.title": "¡Gracias!",
  "feedback.thanks.body": "Recibimos tus comentarios. Realmente ayudan a dar forma a DeCite.",
  "feedback.thanks.again": "Enviar más",
  "feedback.thanks.home": "Volver al inicio",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "Preguntas frecuentes",
  "faq.subtitle":
    "Todo sobre cómo sellar una conversación con IA, citarla y cómo la prueba sigue siendo legible para siempre. ¿No encuentras tu pregunta? Envíala por Sugerencias: respondemos a todo.",
  "faq.group.about": "Sobre DeCite",
  "faq.group.sealing": "Sellar una conversación",
  "faq.group.citation": "Tu cita",
  "faq.group.readers": "Para lectores y revisores",
  "faq.group.trust": "Permanencia y confianza",
  "faq.group.privacy": "Privacidad y seguridad",
  "faq.stillTitle": "¿Aún tienes una pregunta?",
  "faq.stillBody":
    "Si algo aquí no la resolvió, pregúntanos directamente: leemos todos los mensajes y solemos responder en un día.",
  "faq.stillCta": "Hacer una pregunta",
  "faq.sealCta": "Sellar un diálogo",

  "faq.q.what": "¿Qué es DeCite?",
  "faq.a.what":
    "DeCite guarda una conversación que tuviste con una IA en un registro público permanente y te da un código de cita corto —como DC-20260619-01— que puedes poner en tu artículo, libro o publicación. Cualquiera que tenga el código puede luego buscarlo y leer la conversación exacta, palabra por palabra, junto con la fecha y la hora en que se guardó. Convierte un chat que podría desaparecer en una fuente que siempre se puede comprobar.",
  "faq.q.who": "¿Para quién es?",
  "faq.a.who":
    "Para cualquiera cuyo pensamiento haya tomado forma en conversación con una IA y quiera atribuirlo con honestidad: investigadores, estudiantes, autores, periodistas y docentes. Los autores lo usan para crear un registro permanente y citable; los lectores, revisores y editores lo usan para verificar exactamente qué se le preguntó a la IA y qué respondió.",
  "faq.q.free": "¿De verdad es gratis? ¿Hay truco?",
  "faq.a.free":
    "Sellar es gratis durante el lanzamiento: sin cuenta, sin tarjeta, sin pasos ocultos. Nosotros cubrimos el coste de guardar y registrar permanentemente cada conversación. Si eso llegara a cambiar, el precio se mostrará con claridad antes de que selles nada, y las conversaciones ya selladas permanecerán selladas para siempre.",

  "faq.q.how": "¿Cómo sello una conversación?",
  "faq.a.how":
    "Pega un enlace público para compartir tu chat de IA o el texto de la conversación, añade un título breve de dónde la usarás y haz clic en Sellar. En unos segundos, DeCite guarda la conversación en un archivo permanente, reserva tu código de cita y la registra en un registro público. Verás la cita de inmediato y te la enviaremos por correo si añades tu dirección.",
  "faq.q.linkVsPaste": "¿Cuál es la diferencia entre «Enlace oficial» y «Pegar texto directo»?",
  "faq.a.linkVsPaste":
    "Usa Enlace oficial cuando tu IA te dé un enlace público que cualquiera pueda abrir: DeCite lee la conversación desde él y guarda una copia permanente. Usa Pegar texto directo cuando no haya enlace público: pegas tú mismo el texto de la conversación y DeCite guarda exactamente lo que pegas. Ambos producen el mismo tipo de registro permanente y citable.",
  "faq.q.platforms": "¿Qué plataformas de IA son compatibles?",
  "faq.a.platforms":
    "Los enlaces públicos funcionan con ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen y más. Para cualquier IA que no ofrezca un enlace público —o para un chat privado que prefieras pegar— usa Pegar texto directo, que funciona con cualquier herramienta, incluidas las que no están en esta lista.",
  "faq.q.gemini": "Gemini o DeepSeek no me dan un enlace público. ¿Qué hago?",
  "faq.a.gemini":
    "Algunas plataformas mantienen el chat dentro de tu navegador, así que un enlace no lo pueden leer lectores externos. Abre la conversación, selecciona y copia el texto, luego cambia a Pegar texto directo y pégalo. DeCite guarda exactamente lo que pegas. También puedes añadir el enlace del chat original en el campo opcional para que tu cita registre qué IA usaste.",
  "faq.q.account": "¿Necesito una cuenta, un pago o una cartera cripto?",
  "faq.a.account":
    "No. No hay registro, ni tarjeta, ni nada que instalar. No necesitas una cartera ni conocimientos técnicos: DeCite se encarga de guardar y registrar por ti entre bastidores. El correo es opcional y solo se usa para enviarte la cita y permitirte encontrarla de nuevo más tarde.",
  "faq.q.time": "¿Cuánto tarda en sellarse?",
  "faq.a.time":
    "Normalmente solo unos segundos. Mantén la página abierta mientras trabaja: DeCite está guardando la conversación en un archivo permanente, reservando tu código y registrándola en el registro público. Cuando termine, verás tu cita de inmediato.",
  "faq.q.language": "¿Puedo sellar una conversación en cualquier idioma?",
  "faq.a.language":
    "Sí. DeCite guarda el texto de la conversación tal cual, en cualquier idioma y alfabeto. La propia interfaz está disponible en varios idiomas: cámbialo cuando quieras desde el menú de idioma de la barra superior.",

  "faq.q.code": "¿Cómo es el código de cita?",
  "faq.a.code":
    "Es un código corto y limpio con la forma DC-AAAAMMDD-NN; por ejemplo DC-20260619-01, que significa la primera conversación sellada el 19 de junio de 2026. Es fácil de escribir en una bibliografía y fácil de buscar para un lector.",
  "faq.q.cite": "¿Cómo la cito en mi artículo o libro?",
  "faq.a.cite":
    "Al sellar una conversación, DeCite te da una referencia lista en estilo APA 7 que puedes copiar directamente en tu bibliografía, junto con el código de cita y el enlace al registro público. Eres libre de adaptarla al estilo que exija tu revista o editorial.",
  "faq.q.edit": "¿Puedo editar o actualizar una conversación después de sellarla?",
  "faq.a.edit":
    "No, y ese es justamente el sentido. Una conversación sellada no la puede cambiar nadie, ni siquiera nosotros, y eso es precisamente lo que la hace fiable como cita. Si la conversación continuó o quieres capturar una versión más nueva, simplemente vuelve a sellarla para obtener una cita aparte.",
  "faq.q.lost": "Perdí mi código de cita. ¿Cómo lo encuentro de nuevo?",
  "faq.a.lost":
    "Si añadiste tu correo al sellar, ve a Mis recibos e introduce ese mismo correo para ver todos los códigos de cita asociados a él. Si no añadiste un correo, necesitarás el código en sí para buscar la conversación, así que guárdalo en un lugar seguro.",

  "faq.q.lookup": "¿Cómo busca alguien mi cita?",
  "faq.a.lookup":
    "Van a la página Buscar, escriben el código de cita y se abre la conversación sellada exacta: el texto completo, la fecha y la hora en que se selló, y qué IA se usó. No hace falta cuenta ni pago para leerla.",
  "faq.q.readerAccount": "¿Los lectores o revisores necesitan una cuenta para verificar?",
  "faq.a.readerAccount":
    "No. Cualquiera con el código puede leer la conversación, gratis y sin registrarse. Como el registro también vive en infraestructura pública independiente, un revisor decidido puede incluso verificarlo sin usar para nada el sitio web de DeCite.",

  "faq.q.where": "¿Dónde se almacena realmente la conversación?",
  "faq.a.where":
    "En dos lugares públicos independientes que ninguna empresa controla por sí sola: un archivo público permanente que guarda la conversación completa y un registro público que anota su código de cita y el momento en que se selló. DeCite es solo una ventana cómoda a ambos; el registro no depende de nosotros para existir.",
  "faq.q.ifGone": "¿Qué pasa si DeCite desaparece algún día?",
  "faq.a.ifGone":
    "Tus citas siguen funcionando. Como cada una se almacena en infraestructura pública independiente, cualquiera puede abrir directamente el registro público y el archivo permanente: sin sitio web, sin cuenta y sin necesidad de permiso. La prueba sobrevive a la empresa.",
  "faq.q.timestamp": "¿Cómo sé que se puede confiar en la fecha y la hora?",
  "faq.a.timestamp":
    "Cuando se sella una conversación, la fecha y la hora exactas se escriben en un registro público que después no se puede alterar a escondidas. Así que el momento no es solo nuestra palabra: cualquiera puede comprobarlo de forma independiente, y eso es lo que hace que resista el escrutinio.",

  "faq.q.public": "¿La conversación sellada es pública? ¿Quién puede verla?",
  "faq.a.public":
    "Sí. Una conversación sellada está pensada para ser citable, así que cualquiera que tenga el código de cita puede leerla, y permanece pública de forma permanente. Sella solo conversaciones que te sientas cómodo haciendo públicas para siempre.",
  "faq.q.sensitive": "¿Qué pasa con la información personal o confidencial del chat?",
  "faq.a.sensitive":
    "Como sellar es permanente y público, elimina cualquier cosa privada o sensible —nombres, datos de contacto, datos no publicados, cualquier información confidencial— antes de sellar. Una vez sellada, la conversación no se puede editar ni retirar, así que revisa el texto con cuidado primero.",
  "faq.q.email": "¿Guardáis mi correo y para qué?",
  "faq.a.email":
    "El correo es opcional. Si lo proporcionas, lo usamos solo para enviarte tu cita y para que puedas volver a encontrar tus códigos en Mis recibos. No forma parte del registro público y no lo usamos para nada más.",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "Recientes",
  "nav.more": "Más",
  "mint.share.label": "Incluir en la lista pública «Citas recientes»",
  "mint.share.help":
    "Activado por defecto. Cualquiera con el código ya puede leer una cita sellada; esto solo la incluye públicamente para que otros la descubran. Desactívalo para mantenerla fuera de la lista.",
  "latest.title": "Citas recientes",
  "latest.subtitle":
    "Conversaciones selladas recientemente que sus autores eligieron compartir públicamente. Abre cualquiera para leer el diálogo exacto que hay detrás.",
  "latest.loading": "Cargando las citas recientes…",
  "latest.empty": "Aún no hay citas públicas: sella una y podrá aparecer aquí.",
  "latest.notConfigured": "La lista pública aún no está disponible en este sitio.",
  "latest.error": "No se pudo cargar la lista ahora mismo. Inténtalo de nuevo.",
  "latest.anon": "Anónimo",
  "latest.viewAll": "Ver todas",
  "latest.sealCta": "Sellar un diálogo",

  "footer.note": "Permanente · Con fecha y hora · Verificable de forma independiente",
  "common.user": "Usuario",
  "common.assistant": "Asistente",
};

// ─── Français ────────────────────────────────────────────────────────────────
const fr: Dict = {
  "brand.tagline": "Des citations permanentes et vérifiables pour vos conversations avec l'AI",
  "nav.home": "Manifeste",
  "nav.mint": "Sceller un dialogue",
  "nav.verify": "Rechercher",
  "nav.receipts": "Mes reçus",
  "nav.feedback": "Retour",
  "nav.faq": "FAQ",
  "nav.language": "Langue",
  "cta.mint.title": "Pour les auteurs",
  "cta.mint.desc": "Sauvegardez pour toujours une conversation que vous avez eue avec une AI et obtenez une citation à utiliser dans votre travail.",
  "cta.mint.action": "Créer une citation",
  "cta.verify.title": "Pour les lecteurs et relecteurs",
  "cta.verify.desc": "Saisissez un code de citation et lisez la conversation exacte à laquelle il renvoie.",
  "cta.verify.action": "Rechercher une citation",
  "home.eyebrow": "Une attribution honnête à l'ère de l'AI",
  "home.hero.title": "L'AI vous a aidé à pousser la réflexion. Maintenant, citez-la.",
  "home.hero.lede":
    "De plus en plus de recherches naissent d'une conversation avec une AI, mais ces échanges disparaissent discrètement, sont modifiés ou ne peuvent plus être prouvés. DeCite sauvegarde une conversation pour toujours et vous donne un court code de citation à placer dans votre article ou votre livre. Chacun peut ensuite le rechercher et lire exactement ce qui a été dit, et quand. Sans compte, sans paiement, et rien de technique à apprendre.",
  "home.crisis.title": "Quand la conversation disparaît, la preuve aussi",
  "home.crisis.body":
    "Un lien de chat partagé peut cesser de fonctionner, et une plateforme peut modifier ou supprimer une conversation à tout moment. Dès lors, un relecteur ne peut plus vérifier ce qui a été demandé, ce que l'AI a répondu, ni quand — et votre attribution se réduit à votre parole. DeCite rend la conversation permanente, pour qu'on puisse toujours la relire telle quelle, même si la plateforme d'origine a disparu depuis longtemps.",
  "home.pillars.permanence.title": "Permanente",
  "home.pillars.permanence.body": "Une fois sauvegardée, la conversation ne peut être ni modifiée ni discrètement retirée — ni par nous, ni par personne.",
  "home.pillars.timestamp.title": "Horodatée",
  "home.pillars.timestamp.body": "Chaque citation enregistre la date et l'heure exactes de sa sauvegarde : le moment ne peut jamais être contesté.",
  "home.pillars.citation.title": "Facile à citer",
  "home.pillars.citation.body": "Vous obtenez un code court et net comme DC-20260619-01 à insérer directement dans un article ou un livre.",
  "home.quote": "Une citation est la promesse que la source peut être retrouvée. Nous tenons simplement la promesse.",
  "mint.title": "Sceller un dialogue",
  "mint.subtitle": "Sauvegardez la conversation pour toujours et obtenez une citation utilisable.",
  "mint.noWallet": "Rien de technique. DeCite sauvegarde et enregistre la conversation à votre place — collez-la et cliquez sur Sceller.",
  "mint.freeLaunch": "Gratuit pendant le lancement — sans compte, sans carte. DeCite sauvegarde et enregistre votre conversation pour toujours. Ajoutez votre e-mail et nous vous envoyons la citation.",
  "mint.tab.link": "Lien de partage officiel",
  "mint.tab.paste": "Coller le texte",
  "mint.link.label": "Lien de partage de l'AI",
  "mint.link.help": "Un lien public officiel de ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen, etc. Certaines plateformes (p. ex. Gemini, DeepSeek) cachent la conversation aux lecteurs externes : utilisez Coller le texte pour celles-ci.",
  "mint.paste.label": "Texte de la conversation",
  "mint.paste.placeholder": "Collez la conversation ici. Si possible, commencez chaque tour par 'User:' et 'Assistant:'.",
  "mint.paste.help": "À utiliser quand l'AI n'offre pas de lien public : ce que vous collez est sauvegardé tel quel.",
  "mint.originUrl.label": "Lien vers la conversation d'origine avec l'AI (facultatif)",
  "mint.originUrl.help": "Collez le lien du chat d'origine (n'importe quelle AI). Il indique quelle AI vous avez utilisée et permet aux lecteurs d'ouvrir la source — tandis que le texte ci-dessus est ce qui est sauvegardé.",
  "mint.originUrl.detected": "AI détectée : {provider} — elle sera enregistrée avec votre citation.",
  "mint.sourceRef.label": "Où vous l'utiliserez (titre de l'œuvre)",
  "mint.sourceRef.placeholder": "p. ex. Sur l'éthique du raisonnement synthétique (2026), ch. 3",
  "mint.author.label": "Votre nom pour la citation (facultatif)",
  "mint.email.label": "E-mail (facultatif)",
  "mint.email.help": "Nous vous enverrons la citation à cet e-mail et la garderons dans Mes reçus pour la retrouver plus tard.",
  "mint.step.pin": "Sauvegarde de la conversation dans une archive permanente",
  "mint.step.code": "Réservation de votre code de citation",
  "mint.step.notarize": "Enregistrement dans le registre public",
  "mint.step.wait": "Cela prend quelques secondes — gardez cette page ouverte.",
  "mint.action.seal": "Sceller et créer la citation",
  "mint.action.sealing": "Scellage…",
  "mint.action.sealFree": "Sceller gratuitement",
  "mint.action.pay": "Payer ${price} et sceller",
  "mint.action.preparing": "Préparation du paiement sécurisé…",
  "mint.pay.note": "Des frais uniques de ${price} couvrent la sauvegarde et l'enregistrement permanent de votre conversation. Le paiement est géré en toute sécurité par Stripe — nous ne voyons ni ne stockons jamais vos données de carte.",
  "mint.canceled": "Paiement annulé. Votre conversation n'a pas été sauvegardée.",
  "mint.success.title": "Sauvegardé et enregistré",
  "mint.success.desc": "Votre conversation est désormais permanente. Copiez la citation ci-dessous pour votre bibliographie.",
  "mint.success.code": "Code de citation",
  "mint.success.tx": "Registre public",
  "mint.success.apa": "Citation (style APA)",
  "mint.success.custodian": "Enregistré de façon permanente par DeCite pour vous",
  "mint.copy": "Copier",
  "mint.copied": "Copié",
  "mint.viewVerify": "Ouvrir la page de la citation",
  "mint.error.badLink": "Saisissez un lien public valide d'une AI (ChatGPT, Claude, Grok, Perplexity, etc.).",
  "mint.pasteOnlyHint": "{provider} garde la conversation dans votre navigateur, elle ne peut donc pas être lue depuis un lien. Ouvrez votre conversation {provider}, tout sélectionner et copier, puis collez ici — DeCite sauvegarde exactement ce que vous collez.",
  "mint.switchToPaste": "Utiliser Coller le texte",
  "mint.error.empty": "Veuillez ajouter la conversation.",
  "mint.error.sourceRef": "Veuillez indiquer où vous l'utiliserez.",
  "mint.warn.noContract": "Ce site n'est pas encore prêt pour le scellage.",
  "verify.title": "Rechercher une citation",
  "verify.subtitle": "Saisissez un code de citation et lisez la conversation exacte qui se trouve derrière.",
  "verify.input.placeholder": "Saisissez un code, p. ex. DC-20260619-01",
  "verify.action": "Rechercher",
  "verify.error.format": "Cela ne ressemble pas à un code de citation valide (DC-AAAAMMJJ-NN).",
  "verify.error.notFound": "Aucune citation trouvée pour ce code.",
  "verify.error.config": "La recherche n'est pas encore configurée sur ce site.",
  "verify.loading": "Recherche de la citation…",
  "verify.sealed": "SCELLÉ ET VÉRIFIÉ",
  "verify.meta.title": "Détails de la citation",
  "verify.meta.timestamp": "Date du scellage",
  "verify.meta.ai": "AI / Modèle",
  "verify.cite.title": "Prête à citer",
  "verify.cite.help": "Copiez cette référence directement dans la bibliographie de votre article ou livre (style APA 7).",
  "verify.meta.authorName": "Auteur",
  "verify.meta.custodian": "Scellé par",
  "verify.meta.registry": "Registre public",
  "verify.meta.origin": "Mode d'ajout",
  "verify.meta.cid": "ID de l'archive",
  "verify.meta.code": "Code de citation",
  "verify.origin.link": "La conversation d'origine avec l'AI",
  "verify.origin.open": "Ouvrir l'original (site externe)",
  "verify.origin.warn": "Lien externe — la plateforme d'origine a pu modifier ou supprimer cette conversation.",
  "verify.ipfs.title": "Archive permanente",
  "verify.ipfs.desc": "Lisez directement depuis l'archive publique permanente — disponible même si la conversation d'origine est supprimée.",
  "verify.ipfs.open": "Ouvrir le fichier sauvegardé",
  "verify.role.user": "Utilisateur",
  "verify.role.assistant": "Assistant",
  "verify.back": "Rechercher un autre code",
  "verify.perm.title": "Toujours accessible, même sans DeCite",
  "verify.perm.body": "Cette citation est conservée dans deux lieux publics indépendants qu'aucune entreprise ne contrôle : un registre public permanent et une archive publique permanente. Chacun peut ouvrir l'un ou l'autre directement, pour toujours, même si le site DeCite venait à disparaître. Voici les deux façons d'atteindre ce même enregistrement sans nous.",
  "verify.perm.chain": "Le registre public",
  "verify.perm.callHint": "Recherchez votre code, {code}, dans le registre public :",
  "verify.perm.readOn": "Ouvrir le registre public",
  "verify.perm.ipfs": "L'archive permanente",
  "verify.perm.ipfsHint": "Ouvrez la conversation sauvegardée depuis n'importe quelle copie publique de l'archive :",
  "verify.perm.note": "DeCite n'est qu'un moyen pratique de lire tout cela. La citation elle-même vit sur une infrastructure publique indépendante et perdure sans nous.",
  "home.independent.title": "Vos citations ne dépendent pas de nous",
  "home.independent.body": "Chaque citation est sauvegardée dans deux lieux publics indépendants qu'aucune entreprise ne contrôle. Si DeCite venait à disparaître, vos références resteraient lisibles et vérifiables d'elles-mêmes, pour toujours — sans site, sans compte et sans autorisation.",
  "home.independent.viewRegistry": "Voir le registre public",
  "success.error.title": "Nous n'avons pas pu terminer le scellage de votre conversation",
  "success.retry": "Retour au scellage",
  "success.sealAnother": "Sceller une autre conversation",
  "receipts.title": "Mes reçus",
  "receipts.subtitle": "Saisissez l'e-mail utilisé lors du scellage pour retrouver vos codes de citation.",
  "receipts.action": "Rechercher",
  "receipts.empty": "Aucune citation trouvée pour cet e-mail pour l'instant.",
  "receipts.notConfigured": "Les reçus sauvegardés ne sont pas encore disponibles sur ce site.",
  "feedback.title": "Retours et suggestions",
  "feedback.subtitle": "Dites-nous quoi améliorer, signalez un problème ou partagez une idée. Nous lisons tout.",
  "feedback.type.label": "Quel type de retour ?",
  "feedback.type.suggestion": "Suggestion",
  "feedback.type.bug": "Problème",
  "feedback.type.praise": "Compliment",
  "feedback.type.other": "Autre",
  "feedback.message.label": "Votre message",
  "feedback.message.placeholder": "Qu'avez-vous en tête ? Plus c'est précis, mieux c'est.",
  "feedback.email.label": "E-mail (facultatif)",
  "feedback.email.help": "Uniquement si vous souhaitez une réponse. Nous ne l'utiliserons pour rien d'autre.",
  "feedback.submit": "Envoyer le retour",
  "feedback.sending": "Envoi…",
  "feedback.error.empty": "Veuillez saisir un message.",
  "feedback.error.generic": "Une erreur s'est produite. Veuillez réessayer.",
  "feedback.thanks.title": "Merci !",
  "feedback.thanks.body": "Votre retour a bien été reçu. Il aide vraiment à façonner DeCite.",
  "feedback.thanks.again": "Envoyer un autre retour",
  "feedback.thanks.home": "Retour à l'accueil",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "Foire aux questions",
  "faq.subtitle":
    "Tout sur le scellement d'une conversation avec une IA, sa citation et la façon dont la preuve reste lisible pour toujours. Vous ne trouvez pas votre question ? Envoyez-la via Retour — nous répondons à tout.",
  "faq.group.about": "À propos de DeCite",
  "faq.group.sealing": "Sceller une conversation",
  "faq.group.citation": "Votre citation",
  "faq.group.readers": "Pour les lecteurs et relecteurs",
  "faq.group.trust": "Permanence et confiance",
  "faq.group.privacy": "Confidentialité et sécurité",
  "faq.stillTitle": "Encore une question ?",
  "faq.stillBody":
    "Si rien ici n'y a répondu, posez-la-nous directement — nous lisons chaque message et répondons généralement sous un jour.",
  "faq.stillCta": "Poser une question",
  "faq.sealCta": "Sceller un dialogue",

  "faq.q.what": "Qu'est-ce que DeCite ?",
  "faq.a.what":
    "DeCite enregistre une conversation que vous avez eue avec une IA dans un registre public permanent et vous donne un code de citation court — comme DC-20260619-01 — que vous pouvez insérer dans votre article, votre livre ou votre publication. Quiconque possède le code peut ensuite le rechercher et lire la conversation exacte, mot pour mot, ainsi que la date et l'heure de l'enregistrement. Cela transforme un échange qui pourrait disparaître en une source toujours vérifiable.",
  "faq.q.who": "À qui cela s'adresse-t-il ?",
  "faq.a.who":
    "À toute personne dont la réflexion a pris forme au fil d'une conversation avec une IA et qui souhaite l'attribuer honnêtement : chercheurs, étudiants, auteurs, journalistes et enseignants. Les auteurs s'en servent pour créer un enregistrement permanent et citable ; les lecteurs, relecteurs et éditeurs s'en servent pour vérifier exactement ce qui a été demandé à l'IA et ce qu'elle a répondu.",
  "faq.q.free": "Est-ce vraiment gratuit ? Y a-t-il un piège ?",
  "faq.a.free":
    "Le scellement est gratuit pendant notre lancement — sans compte, sans carte, sans étape cachée. Nous prenons en charge le coût d'enregistrement et d'inscription permanente de chaque conversation. Si cela devait changer, le prix serait clairement affiché avant que vous ne scelliez quoi que ce soit, et les conversations déjà scellées le resteront pour toujours.",

  "faq.q.how": "Comment sceller une conversation ?",
  "faq.a.how":
    "Collez soit un lien de partage public vers votre échange avec l'IA, soit le texte de la conversation lui-même, ajoutez un titre court indiquant où vous l'utiliserez, puis cliquez sur Sceller. En quelques secondes, DeCite enregistre la conversation dans une archive permanente, réserve votre code de citation et l'inscrit dans un registre public. Vous voyez la citation aussitôt, et nous vous l'envoyons par e-mail si vous indiquez votre adresse.",
  "faq.q.linkVsPaste": "Quelle est la différence entre « Lien de partage officiel » et « Coller le texte » ?",
  "faq.a.linkVsPaste":
    "Utilisez Lien de partage officiel lorsque votre IA vous fournit un lien public que tout le monde peut ouvrir — DeCite y lit la conversation et en enregistre une copie permanente. Utilisez Coller le texte lorsqu'il n'y a pas de lien public : vous collez vous-même le texte de la conversation et DeCite enregistre exactement ce que vous collez. Les deux produisent le même type d'enregistrement permanent et citable.",
  "faq.q.platforms": "Quelles plateformes d'IA sont prises en charge ?",
  "faq.a.platforms":
    "Les liens de partage publics fonctionnent avec ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen et d'autres. Pour toute IA qui ne propose pas de lien public — ou pour un échange privé que vous préférez coller — utilisez Coller le texte, qui fonctionne avec n'importe quel outil, y compris ceux qui ne figurent pas dans cette liste.",
  "faq.q.gemini": "Gemini ou DeepSeek ne me donnent pas de lien public. Que faire ?",
  "faq.a.gemini":
    "Certaines plateformes conservent l'échange dans votre navigateur ; un lien ne peut donc pas être lu par des lecteurs extérieurs. Ouvrez la conversation, sélectionnez et copiez le texte, puis passez à Coller le texte et collez-le. DeCite enregistre exactement ce que vous collez. Vous pouvez aussi ajouter le lien de l'échange d'origine dans le champ facultatif pour que votre citation note quelle IA vous avez utilisée.",
  "faq.q.account": "Ai-je besoin d'un compte, d'un paiement ou d'un portefeuille crypto ?",
  "faq.a.account":
    "Non. Aucune inscription, aucune carte, rien à installer. Vous n'avez besoin ni de portefeuille ni de connaissances techniques — DeCite s'occupe de l'enregistrement et de l'inscription pour vous en coulisses. L'e-mail est facultatif et sert uniquement à vous envoyer la citation et à vous permettre de la retrouver plus tard.",
  "faq.q.time": "Combien de temps prend le scellement ?",
  "faq.a.time":
    "Généralement quelques secondes seulement. Laissez la page ouverte pendant le traitement — DeCite enregistre la conversation dans une archive permanente, réserve votre code et l'inscrit dans le registre public. Une fois terminé, vous voyez votre citation immédiatement.",
  "faq.q.language": "Puis-je sceller une conversation dans n'importe quelle langue ?",
  "faq.a.language":
    "Oui. DeCite enregistre le texte de la conversation tel quel, dans n'importe quelle langue et écriture. L'interface elle-même est disponible en plusieurs langues — changez-la à tout moment depuis le menu de langue de la barre supérieure.",

  "faq.q.code": "À quoi ressemble le code de citation ?",
  "faq.a.code":
    "C'est un code court et net de la forme DC-AAAAMMJJ-NN — par exemple DC-20260619-01, soit la première conversation scellée le 19 juin 2026. Il est facile à saisir dans une bibliographie et facile à rechercher pour un lecteur.",
  "faq.q.cite": "Comment la citer dans mon article ou mon livre ?",
  "faq.a.cite":
    "Lorsque vous scellez une conversation, DeCite vous fournit une référence prête à l'emploi au format APA 7 que vous pouvez copier directement dans votre bibliographie, avec le code de citation et le lien vers le registre public. Vous êtes libre de l'adapter au style exigé par votre revue ou votre éditeur.",
  "faq.q.edit": "Puis-je modifier ou mettre à jour une conversation après l'avoir scellée ?",
  "faq.a.edit":
    "Non — et c'est tout l'intérêt. Une conversation scellée ne peut être modifiée par personne, pas même par nous, et c'est précisément ce qui la rend fiable comme citation. Si la conversation s'est poursuivie ou si vous voulez en saisir une version plus récente, scellez-la simplement à nouveau pour obtenir une citation distincte.",
  "faq.q.lost": "J'ai perdu mon code de citation. Comment le retrouver ?",
  "faq.a.lost":
    "Si vous avez indiqué votre e-mail lors du scellement, allez dans Mes reçus et saisissez ce même e-mail pour voir tous les codes de citation qui y sont liés. Si vous n'avez pas indiqué d'e-mail, il vous faudra le code lui-même pour rechercher la conversation — conservez-le donc en lieu sûr.",

  "faq.q.lookup": "Comment quelqu'un recherche-t-il ma citation ?",
  "faq.a.lookup":
    "Il se rend sur la page Rechercher, saisit le code de citation, et la conversation scellée exacte s'ouvre : le texte intégral, la date et l'heure du scellement, et l'IA utilisée. Aucun compte ni paiement n'est nécessaire pour la lire.",
  "faq.q.readerAccount": "Les lecteurs ou relecteurs ont-ils besoin d'un compte pour vérifier ?",
  "faq.a.readerAccount":
    "Non. Quiconque possède le code peut lire la conversation, gratuitement et sans inscription. Comme l'enregistrement réside aussi sur une infrastructure publique indépendante, un relecteur déterminé peut même le vérifier sans utiliser le site DeCite du tout.",

  "faq.q.where": "Où la conversation est-elle réellement stockée ?",
  "faq.a.where":
    "Dans deux lieux publics indépendants qu'aucune entreprise ne contrôle à elle seule : une archive publique permanente qui conserve la conversation intégrale, et un registre public qui consigne son code de citation et le moment du scellement. DeCite n'est qu'une fenêtre pratique vers les deux — l'enregistrement ne dépend pas de nous pour exister.",
  "faq.q.ifGone": "Que se passe-t-il si DeCite venait à disparaître ?",
  "faq.a.ifGone":
    "Vos citations continuent de fonctionner. Comme chacune est stockée sur une infrastructure publique indépendante, n'importe qui peut toujours ouvrir directement le registre public et l'archive permanente — sans site web, sans compte et sans autorisation. La preuve survit à l'entreprise.",
  "faq.q.timestamp": "Comment savoir que la date et l'heure sont fiables ?",
  "faq.a.timestamp":
    "Lorsqu'une conversation est scellée, la date et l'heure exactes sont inscrites dans un registre public qui ne peut être discrètement altéré par la suite. L'horodatage n'est donc pas seulement notre parole — n'importe qui peut le vérifier de façon indépendante, et c'est ce qui lui permet de résister à l'examen.",

  "faq.q.public": "La conversation scellée est-elle publique ? Qui peut la voir ?",
  "faq.a.public":
    "Oui. Une conversation scellée est destinée à être citable, donc quiconque possède le code de citation peut la lire, et elle reste publique de façon permanente. Ne scellez que des conversations que vous êtes à l'aise de rendre publiques pour toujours.",
  "faq.q.sensitive": "Et les informations personnelles ou confidentielles dans l'échange ?",
  "faq.a.sensitive":
    "Le scellement étant permanent et public, retirez tout élément privé ou sensible — noms, coordonnées, données non publiées, toute information confidentielle — avant de sceller. Une fois scellée, la conversation ne peut être ni modifiée ni retirée, alors relisez attentivement le texte au préalable.",
  "faq.q.email": "Conservez-vous mon e-mail, et pour quoi faire ?",
  "faq.a.email":
    "L'e-mail est facultatif. Si vous en fournissez un, nous l'utilisons uniquement pour vous envoyer votre citation et vous permettre de retrouver vos codes dans Mes reçus. Il ne fait pas partie du registre public et nous ne l'utilisons pour rien d'autre.",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "Récentes",
  "nav.more": "Plus",
  "mint.share.label": "Ajouter à la liste publique « Citations récentes »",
  "mint.share.help":
    "Activé par défaut. Quiconque possède le code peut déjà lire une citation scellée ; ceci la liste simplement publiquement pour que d'autres la découvrent. Désactivez-le pour la garder hors de la liste.",
  "latest.title": "Citations récentes",
  "latest.subtitle":
    "Conversations récemment scellées que leurs auteurs ont choisi de partager publiquement. Ouvrez-en une pour lire le dialogue exact qui se trouve derrière.",
  "latest.loading": "Chargement des citations récentes…",
  "latest.empty": "Aucune citation publique pour l'instant — scellez-en une et elle pourra apparaître ici.",
  "latest.notConfigured": "La liste publique n'est pas encore disponible sur ce site.",
  "latest.error": "La liste n'a pas pu être chargée pour le moment. Veuillez réessayer.",
  "latest.anon": "Anonyme",
  "latest.viewAll": "Tout voir",
  "latest.sealCta": "Sceller un dialogue",

  "footer.note": "Permanent · Horodaté · Vérifiable de façon indépendante",
  "common.user": "Utilisateur",
  "common.assistant": "Assistant",
};

// ─── العربية (Arabic, RTL) ──────────────────────────────────────────────────
const ar: Dict = {
  "brand.tagline": "استشهادات دائمة وقابلة للتحقق لمحادثاتك مع AI",
  "nav.home": "البيان",
  "nav.mint": "ختم حوار",
  "nav.verify": "بحث",
  "nav.receipts": "إيصالاتي",
  "nav.feedback": "ملاحظات",
  "nav.faq": "الأسئلة الشائعة",
  "nav.language": "اللغة",
  "cta.mint.title": "للمؤلفين",
  "cta.mint.desc": "احفظ إلى الأبد محادثة أجريتها مع AI واحصل على استشهاد تضعه في عملك.",
  "cta.mint.action": "أنشئ استشهادًا",
  "cta.verify.title": "للقرّاء والمراجعين",
  "cta.verify.desc": "أدخل أي رمز استشهاد واقرأ المحادثة نفسها التي يشير إليها.",
  "cta.verify.action": "ابحث عن استشهاد",
  "home.eyebrow": "عزوٌ أمين في عصر AI",
  "home.hero.title": "ساعدتك AI على بلورة فكرتك. الآن، استشهد بها.",
  "home.hero.lede":
    "تتشكّل أبحاث أكثر فأكثر في حوار مع AI — لكن تلك المحادثات تختفي بهدوء، أو تُحرَّر، أو يتعذّر إثباتها لاحقًا. يحفظ DeCite المحادثة إلى الأبد ويمنحك رمز استشهاد قصيرًا تضعه في بحثك أو كتابك. ويمكن لأي شخص بعدها أن يبحث عنه ويقرأ بالضبط ما قيل ومتى. دون حساب ودون دفع ودون أي شيء تقني تتعلّمه.",
  "home.crisis.title": "حين تختفي المحادثة، يختفي الدليل",
  "home.crisis.body":
    "قد يتوقّف رابط محادثة مشترك عن العمل، وقد تحرّر منصة محادثة أو تحذفها في أي وقت. عندئذ لا يستطيع المراجع التحقّق مما سُئل، ولا بما أجابت AI، ولا متى حدث ذلك — ويصبح عزوك مجرد كلامك. يجعل DeCite المحادثة دائمة، فتُقرأ دائمًا كما كانت تمامًا، حتى لو زالت المنصة الأصلية منذ زمن.",
  "home.pillars.permanence.title": "دائمة",
  "home.pillars.permanence.body": "بمجرد حفظها، لا يمكن تحرير المحادثة ولا إزالتها بهدوء — لا منّا ولا من أي أحد.",
  "home.pillars.timestamp.title": "مؤرّخة بالوقت",
  "home.pillars.timestamp.body": "يسجّل كل استشهاد تاريخ ووقت حفظه بدقّة، فلا يقبل التوقيت أي جدال.",
  "home.pillars.citation.title": "سهلة الاستشهاد",
  "home.pillars.citation.body": "تحصل على رمز قصير وواضح مثل DC-20260619-01 تضعه مباشرة في بحث أو كتاب.",
  "home.quote": "الاستشهاد وعدٌ بأن المصدر يمكن العثور عليه. نحن ببساطة نفي بالوعد.",
  "mint.title": "ختم حوار",
  "mint.subtitle": "احفظ المحادثة إلى الأبد واحصل على استشهاد يمكنك اقتباسه.",
  "mint.noWallet": "لا شيء تقني. يحفظ DeCite المحادثة ويسجّلها بشكل دائم نيابةً عنك — فقط الصقها واضغط ختم.",
  "mint.freeLaunch": "مجاني خلال الإطلاق — دون حساب ودون بطاقة. يحفظ DeCite محادثتك ويسجّلها إلى الأبد. أضف بريدك وسنرسل لك الاستشهاد.",
  "mint.tab.link": "رابط مشاركة رسمي",
  "mint.tab.paste": "لصق النص مباشرة",
  "mint.link.label": "رابط مشاركة AI",
  "mint.link.help": "رابط مشاركة عام رسمي من ChatGPT وClaude وGrok وCopilot وPerplexity وPoe وMistral وMeta AI وQwen وغيرها. بعض المنصات (مثل Gemini وDeepSeek) تُخفي المحادثة عن القرّاء الخارجيين — استخدم لصق النص مباشرة لتلك المنصات.",
  "mint.paste.label": "نص المحادثة",
  "mint.paste.placeholder": "الصق المحادثة هنا. إن أمكن، ابدأ كل دور بـ 'User:' و'Assistant:'.",
  "mint.paste.help": "استخدمه عندما لا توفّر AI رابط مشاركة عامًا — يُحفظ تمامًا ما تلصقه.",
  "mint.originUrl.label": "رابط محادثة AI الأصلية (اختياري)",
  "mint.originUrl.help": "الصق رابط المحادثة الأصلية (أي AI). يسجّل أي AI استخدمت ويتيح للقرّاء فتح المصدر — بينما النص أعلاه هو ما يُحفظ.",
  "mint.originUrl.detected": "تم اكتشاف AI: {provider} — سيُسجَّل مع استشهادك.",
  "mint.sourceRef.label": "أين ستستخدمه (عنوان العمل)",
  "mint.sourceRef.placeholder": "مثال: في أخلاقيات الاستدلال الاصطناعي (2026)، الفصل 3",
  "mint.author.label": "اسمك في الاستشهاد (اختياري)",
  "mint.email.label": "البريد الإلكتروني (اختياري)",
  "mint.email.help": "سنرسل الاستشهاد إلى هذا البريد ونحفظه في إيصالاتي لتجده لاحقًا.",
  "mint.step.pin": "جارٍ حفظ المحادثة في أرشيف دائم",
  "mint.step.code": "جارٍ حجز رمز استشهادك",
  "mint.step.notarize": "جارٍ تسجيله في السجل العام",
  "mint.step.wait": "يستغرق هذا بضع ثوانٍ — أبقِ هذه الصفحة مفتوحة.",
  "mint.action.seal": "اختم وأنشئ الاستشهاد",
  "mint.action.sealing": "جارٍ الختم…",
  "mint.action.sealFree": "اختم مجانًا",
  "mint.action.pay": "ادفع ${price} واختم",
  "mint.action.preparing": "جارٍ تجهيز الدفع الآمن…",
  "mint.pay.note": "رسوم لمرة واحدة قدرها ${price} تغطي حفظ محادثتك وتسجيلها بشكل دائم. يُعالَج الدفع بأمان عبر Stripe — لا نرى بيانات بطاقتك ولا نخزّنها أبدًا.",
  "mint.canceled": "أُلغي الدفع. لم تُحفظ محادثتك.",
  "mint.success.title": "مُحفوظ ومُسجَّل",
  "mint.success.desc": "أصبحت محادثتك دائمة الآن. انسخ الاستشهاد أدناه لقائمة مراجعك.",
  "mint.success.code": "رمز الاستشهاد",
  "mint.success.tx": "سجل عام",
  "mint.success.apa": "استشهاد (نمط APA)",
  "mint.success.custodian": "سجّله DeCite بشكل دائم نيابةً عنك",
  "mint.copy": "نسخ",
  "mint.copied": "تم النسخ",
  "mint.viewVerify": "افتح صفحة الاستشهاد",
  "mint.error.badLink": "أدخل رابط مشاركة AI عامًا صالحًا (ChatGPT وClaude وGrok وPerplexity وغيرها).",
  "mint.pasteOnlyHint": "يحتفظ {provider} بالمحادثة داخل متصفحك، لذا لا يمكن قراءتها من رابط. افتح محادثة {provider}، حدّد الكل وانسخ، ثم الصق هنا — يحفظ DeCite تمامًا ما تلصقه.",
  "mint.switchToPaste": "استخدم لصق النص مباشرة",
  "mint.error.empty": "يرجى إضافة المحادثة.",
  "mint.error.sourceRef": "يرجى ذكر أين ستستخدمه.",
  "mint.warn.noContract": "هذا الموقع غير جاهز للختم بعد.",
  "verify.title": "ابحث عن استشهاد",
  "verify.subtitle": "أدخل رمز استشهاد واقرأ المحادثة نفسها التي خلفه.",
  "verify.input.placeholder": "أدخل رمز استشهاد، مثل DC-20260619-01",
  "verify.action": "بحث",
  "verify.error.format": "لا يبدو هذا رمز استشهاد صالحًا (DC-YYYYMMDD-NN).",
  "verify.error.notFound": "لم يُعثر على استشهاد لهذا الرمز.",
  "verify.error.config": "البحث غير مُعدّ على هذا الموقع بعد.",
  "verify.loading": "جارٍ البحث عن الاستشهاد…",
  "verify.sealed": "مختوم ومُتحقَّق منه",
  "verify.meta.title": "تفاصيل الاستشهاد",
  "verify.meta.timestamp": "تاريخ الختم",
  "verify.meta.ai": "AI / النموذج",
  "verify.cite.title": "جاهز للاستشهاد",
  "verify.cite.help": "انسخ هذا المرجع مباشرةً إلى قائمة مراجع بحثك أو كتابك (نمط APA 7).",
  "verify.meta.authorName": "المؤلف",
  "verify.meta.custodian": "خَتَمه",
  "verify.meta.registry": "السجل العام",
  "verify.meta.origin": "كيف أُضيف",
  "verify.meta.cid": "معرّف الأرشيف",
  "verify.meta.code": "رمز الاستشهاد",
  "verify.origin.link": "محادثة AI الأصلية",
  "verify.origin.open": "افتح الأصل (موقع خارجي)",
  "verify.origin.warn": "رابط خارجي — ربما غيّرت المنصة الأصلية هذه المحادثة أو أزالتها.",
  "verify.ipfs.title": "أرشيف دائم",
  "verify.ipfs.desc": "اقرأ مباشرةً من الأرشيف العام الدائم — متاح حتى لو حُذفت المحادثة الأصلية.",
  "verify.ipfs.open": "افتح الملف المحفوظ",
  "verify.role.user": "المستخدم",
  "verify.role.assistant": "المساعد",
  "verify.back": "ابحث عن رمز آخر",
  "verify.perm.title": "متاح دائمًا — حتى بدون DeCite",
  "verify.perm.body": "يُحفظ هذا الاستشهاد في مكانين عامين مستقلين لا تتحكم بهما أي شركة بمفردها: سجل عام دائم وأرشيف عام دائم. يمكن لأي شخص فتح أي منهما مباشرةً وإلى الأبد — حتى لو زال موقع DeCite يومًا. وفيما يلي طريقتان للوصول إلى السجل نفسه من دوننا.",
  "verify.perm.chain": "السجل العام",
  "verify.perm.callHint": "ابحث عن رمزك، {code}، في السجل العام:",
  "verify.perm.readOn": "افتح السجل العام",
  "verify.perm.ipfs": "الأرشيف الدائم",
  "verify.perm.ipfsHint": "افتح المحادثة المحفوظة من أي نسخة عامة من الأرشيف:",
  "verify.perm.note": "DeCite مجرد طريقة مريحة لقراءة كل هذا. الاستشهاد نفسه يقيم على بنية تحتية عامة مستقلة ويبقى من دوننا.",
  "home.independent.title": "استشهاداتك لا تعتمد علينا",
  "home.independent.body": "يُحفظ كل استشهاد في مكانين عامين مستقلين لا تتحكم بهما أي شركة بمفردها. إذا اختفى DeCite يومًا، تبقى مراجعك قابلة للقراءة والتحقق بنفسها وإلى الأبد — دون موقع ودون حساب ودون إذن.",
  "home.independent.viewRegistry": "اعرض السجل العام",
  "success.error.title": "تعذّر إكمال ختم محادثتك",
  "success.retry": "العودة إلى الختم",
  "success.sealAnother": "اختم محادثة أخرى",
  "receipts.title": "إيصالاتي",
  "receipts.subtitle": "أدخل البريد الذي استخدمته عند الختم للعثور على رموز استشهادك.",
  "receipts.action": "بحث",
  "receipts.empty": "لم يُعثر بعد على استشهادات لهذا البريد.",
  "receipts.notConfigured": "الإيصالات المحفوظة غير متاحة على هذا الموقع بعد.",
  "feedback.title": "الملاحظات والاقتراحات",
  "feedback.subtitle": "أخبرنا بما يجب تحسينه، أو أبلغ عن مشكلة، أو شارك فكرة. نقرأ كل شيء.",
  "feedback.type.label": "ما نوع الملاحظة؟",
  "feedback.type.suggestion": "اقتراح",
  "feedback.type.bug": "مشكلة",
  "feedback.type.praise": "إطراء",
  "feedback.type.other": "أخرى",
  "feedback.message.label": "رسالتك",
  "feedback.message.placeholder": "ما الذي يدور في ذهنك؟ كلما كان أكثر تحديدًا كان أفضل.",
  "feedback.email.label": "البريد الإلكتروني (اختياري)",
  "feedback.email.help": "فقط إذا كنت ترغب في رد. لن نستخدمه لأي غرض آخر.",
  "feedback.submit": "إرسال الملاحظات",
  "feedback.sending": "جارٍ الإرسال…",
  "feedback.error.empty": "يرجى إدخال رسالة.",
  "feedback.error.generic": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  "feedback.thanks.title": "شكرًا لك!",
  "feedback.thanks.body": "تم استلام ملاحظتك. إنها تساعد فعلًا في تشكيل DeCite.",
  "feedback.thanks.again": "إرسال المزيد",
  "feedback.thanks.home": "العودة إلى الرئيسية",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "الأسئلة الشائعة",
  "faq.subtitle":
    "كل ما يتعلق بختم محادثة مع الذكاء الاصطناعي والاستشهاد بها وكيف يبقى الدليل قابلاً للقراءة إلى الأبد. لم تجد سؤالك؟ أرسله عبر الملاحظات — نجيب عن كل شيء.",
  "faq.group.about": "حول DeCite",
  "faq.group.sealing": "ختم محادثة",
  "faq.group.citation": "استشهادك",
  "faq.group.readers": "للقرّاء والمراجعين",
  "faq.group.trust": "الدوام والموثوقية",
  "faq.group.privacy": "الخصوصية والأمان",
  "faq.stillTitle": "ما زال لديك سؤال؟",
  "faq.stillBody":
    "إذا لم يُجب شيء هنا عن سؤالك، فاسألنا مباشرةً — نقرأ كل رسالة ونرد عادةً خلال يوم واحد.",
  "faq.stillCta": "اطرح سؤالاً",
  "faq.sealCta": "اختم محادثة",

  "faq.q.what": "ما هو DeCite؟",
  "faq.a.what":
    "يحفظ DeCite محادثة أجريتها مع ذكاء اصطناعي في سجل عام دائم ويمنحك رمز استشهاد قصيرًا — مثل DC-20260619-01 — يمكنك وضعه في ورقتك البحثية أو كتابك أو مقالتك. وأي شخص لديه الرمز يستطيع لاحقًا البحث عنه وقراءة المحادثة نفسها كلمة بكلمة، مع التاريخ والوقت اللذين حُفظت فيهما. إنه يحوّل محادثة قد تختفي إلى مصدر يمكن التحقق منه دائمًا.",
  "faq.q.who": "لمن هذه الخدمة؟",
  "faq.a.who":
    "لكل من تبلور تفكيره خلال محادثة مع ذكاء اصطناعي ويريد أن يَنسب ذلك بأمانة — الباحثون والطلاب والمؤلفون والصحفيون والمعلمون. يستخدمه المؤلفون لإنشاء سجل دائم قابل للاستشهاد؛ ويستخدمه القرّاء والمراجعون والمحررون للتحقق بدقة مما سُئل عنه الذكاء الاصطناعي وما أجاب به.",
  "faq.q.free": "هل هو مجاني حقًا؟ هل من مقابل خفي؟",
  "faq.a.free":
    "الختم مجاني خلال فترة الإطلاق — بلا حساب ولا بطاقة ولا خطوة خفية. نحن نتحمّل تكلفة حفظ كل محادثة وتسجيلها بشكل دائم نيابةً عنك. وإن تغيّر ذلك يومًا، فسيُعرض السعر بوضوح قبل أن تختم أي شيء، وتبقى المحادثات المختومة بالفعل مختومة إلى الأبد.",

  "faq.q.how": "كيف أختم محادثة؟",
  "faq.a.how":
    "الصق إمّا رابط مشاركة عامًا لمحادثة الذكاء الاصطناعي وإمّا نص المحادثة نفسه، وأضف عنوانًا قصيرًا لمكان استخدامك له، ثم انقر «اختم». في غضون ثوانٍ يحفظ DeCite المحادثة في أرشيف دائم، ويحجز رمز الاستشهاد الخاص بك، ويسجّلها في سجل عام. ستظهر لك الاستشهاد فورًا، وسنرسله إليك عبر البريد إن أضفت عنوانك.",
  "faq.q.linkVsPaste": "ما الفرق بين «رابط مشاركة رسمي» و«لصق النص مباشرة»؟",
  "faq.a.linkVsPaste":
    "استخدم «رابط مشاركة رسمي» عندما يمنحك الذكاء الاصطناعي رابطًا عامًا يستطيع أي شخص فتحه — يقرأ DeCite المحادثة منه ويحفظ نسخة دائمة. واستخدم «لصق النص مباشرة» عند عدم وجود رابط عام: تلصق نص المحادثة بنفسك ويحفظ DeCite بالضبط ما تلصقه. وكلاهما ينتج النوع نفسه من السجل الدائم القابل للاستشهاد.",
  "faq.q.platforms": "ما منصات الذكاء الاصطناعي المدعومة؟",
  "faq.a.platforms":
    "تعمل روابط المشاركة العامة من ChatGPT وClaude وGrok وCopilot وPerplexity وPoe وMistral وMeta AI وQwen وغيرها. ولأي ذكاء اصطناعي لا يوفّر رابطًا عامًا — أو لمحادثة خاصة تفضّل لصقها — استخدم «لصق النص مباشرة»، الذي يعمل مع أي أداة، بما فيها غير المدرجة هنا.",
  "faq.q.gemini": "Gemini أو DeepSeek لا يمنحانني رابطًا عامًا. ماذا أفعل؟",
  "faq.a.gemini":
    "تُبقي بعض المنصات المحادثة داخل متصفّحك، لذا لا يستطيع القرّاء الخارجيون قراءتها من رابط. افتح المحادثة، وحدّد النص وانسخه، ثم انتقل إلى «لصق النص مباشرة» والصقه. يحفظ DeCite بالضبط ما تلصقه. ويمكنك أيضًا إضافة رابط المحادثة الأصلية في الحقل الاختياري كي يسجّل استشهادك أي ذكاء اصطناعي استخدمت.",
  "faq.q.account": "هل أحتاج إلى حساب أو دفع أو محفظة عملات رقمية؟",
  "faq.a.account":
    "لا. لا تسجيل ولا بطاقة ولا شيء لتثبيته. لا تحتاج إلى محفظة ولا إلى أي معرفة تقنية — يتولّى DeCite الحفظ والتسجيل نيابةً عنك خلف الكواليس. البريد الإلكتروني اختياري، ويُستخدم فقط لإرسال الاستشهاد إليك وتمكينك من إيجاده لاحقًا.",
  "faq.q.time": "كم يستغرق الختم؟",
  "faq.a.time":
    "عادةً بضع ثوانٍ فقط. أبقِ الصفحة مفتوحة أثناء العمل — يحفظ DeCite المحادثة في أرشيف دائم، ويحجز رمزك، ويسجّلها في السجل العام. وعند الانتهاء سترى استشهادك فورًا.",
  "faq.q.language": "هل يمكنني ختم محادثة بأي لغة؟",
  "faq.a.language":
    "نعم. يحفظ DeCite نص المحادثة كما هو تمامًا، بأي لغة وأي خط. والواجهة نفسها متوفرة بعدة لغات — بدّلها في أي وقت من قائمة اللغة في الشريط العلوي.",

  "faq.q.code": "كيف يبدو رمز الاستشهاد؟",
  "faq.a.code":
    "إنه رمز قصير وواضح بصيغة DC-YYYYMMDD-NN — مثل DC-20260619-01، أي أول محادثة مختومة في 19 يونيو 2026. يَسهُل كتابته في قائمة المراجع ويَسهُل على القارئ البحث عنه.",
  "faq.q.cite": "كيف أستشهد به في ورقتي أو كتابي؟",
  "faq.a.cite":
    "عند ختم محادثة، يمنحك DeCite مرجعًا جاهزًا بنمط APA 7 يمكنك نسخه مباشرةً إلى قائمة مراجعك، مع رمز الاستشهاد ورابط السجل العام. ولك مطلق الحرية في تكييفه مع أي نمط تطلبه مجلتك أو دار نشرك.",
  "faq.q.edit": "هل يمكنني تعديل محادثة أو تحديثها بعد ختمها؟",
  "faq.a.edit":
    "لا — وهذا هو جوهر الفكرة. لا يستطيع أحد تغيير محادثة مختومة، ولا نحن أنفسنا، وهذا بالضبط ما يجعلها جديرة بالثقة كاستشهاد. وإن استمرّت المحادثة أو أردت حفظ نسخة أحدث، فاختمها من جديد فحسب لتحصل على استشهاد منفصل.",
  "faq.q.lost": "فقدت رمز الاستشهاد. كيف أجده مجددًا؟",
  "faq.a.lost":
    "إن أضفت بريدك عند الختم، فانتقل إلى «إيصالاتي» وأدخل البريد نفسه لترى كل رموز الاستشهاد المرتبطة به. وإن لم تضف بريدًا، فستحتاج إلى الرمز نفسه للبحث عن المحادثة — لذا احتفظ به في مكان آمن.",

  "faq.q.lookup": "كيف يبحث شخص ما عن استشهادي؟",
  "faq.a.lookup":
    "ينتقل إلى صفحة «بحث»، ويكتب رمز الاستشهاد، فتُفتح المحادثة المختومة نفسها بالضبط — النص الكامل، وتاريخ ووقت الختم، والذكاء الاصطناعي المستخدَم. ولا يلزم حساب ولا دفع لقراءتها.",
  "faq.q.readerAccount": "هل يحتاج القرّاء أو المراجعون إلى حساب للتحقق؟",
  "faq.a.readerAccount":
    "لا. أي شخص لديه الرمز يستطيع قراءة المحادثة مجانًا وبلا تسجيل. ولأن السجل موجود أيضًا على بنية تحتية عامة مستقلة، يستطيع المراجع الجادّ التحقق منه حتى دون استخدام موقع DeCite إطلاقًا.",

  "faq.q.where": "أين تُخزَّن المحادثة فعليًا؟",
  "faq.a.where":
    "في مكانين عامين مستقلين لا تتحكّم فيهما أي شركة بمفردها: أرشيف عام دائم يحفظ المحادثة كاملة، وسجل عام يدوّن رمز استشهادها ولحظة ختمها. وما DeCite إلا نافذة مريحة على كليهما — فوجود السجل لا يعتمد علينا.",
  "faq.q.ifGone": "ماذا يحدث إن اختفى DeCite يومًا ما؟",
  "faq.a.ifGone":
    "تظل استشهاداتك تعمل. لأن كلًا منها مخزَّن على بنية تحتية عامة مستقلة، يستطيع أي شخص فتح السجل العام والأرشيف الدائم مباشرةً — بلا موقع ولا حساب ولا إذن. فالدليل يبقى أطول من الشركة.",
  "faq.q.timestamp": "كيف أعرف أن التاريخ والوقت جديران بالثقة؟",
  "faq.a.timestamp":
    "عند ختم محادثة، يُكتب تاريخها ووقتها بالضبط في سجل عام لا يمكن العبث به خفيةً لاحقًا. فالتوقيت ليس مجرد كلامنا — يستطيع أي شخص التحقق منه باستقلالية، وهذا ما يجعله يصمد أمام التدقيق.",

  "faq.q.public": "هل المحادثة المختومة عامة؟ ومن يستطيع رؤيتها؟",
  "faq.a.public":
    "نعم. المحادثة المختومة مُعدّة لتكون قابلة للاستشهاد، لذا يستطيع أي شخص لديه رمز الاستشهاد قراءتها، وتبقى عامة بشكل دائم. اختم فقط المحادثات التي تطمئن إلى جعلها عامة إلى الأبد.",
  "faq.q.sensitive": "ماذا عن المعلومات الشخصية أو السرية في المحادثة؟",
  "faq.a.sensitive":
    "لأن الختم دائم وعام، احذف أي شيء خاص أو حساس — الأسماء وبيانات الاتصال والبيانات غير المنشورة وأي معلومة سرية — قبل الختم. وبمجرد ختم المحادثة لا يمكن تعديلها ولا إزالتها، لذا راجع النص بعناية أولاً.",
  "faq.q.email": "هل تخزّنون بريدي الإلكتروني، ولماذا؟",
  "faq.a.email":
    "البريد اختياري. إن قدّمته، نستخدمه فقط لإرسال استشهادك إليك وتمكينك من إيجاد رموزك مجددًا في «إيصالاتي». وهو ليس جزءًا من السجل العام ولا نستخدمه لأي غرض آخر.",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "الأحدث",
  "nav.more": "المزيد",
  "mint.share.label": "أدرِجها في قائمة «أحدث الاستشهادات» العامة",
  "mint.share.help":
    "مُفعّل افتراضيًا. من لديه الرمز يستطيع أصلًا قراءة استشهاد مختوم؛ هذا الخيار يدرجه علنًا فقط ليكتشفه الآخرون. أوقِفه لإبقائه خارج القائمة.",
  "latest.title": "أحدث الاستشهادات",
  "latest.subtitle":
    "محادثات مختومة حديثًا اختار مؤلفوها مشاركتها علنًا. افتح أيًا منها لقراءة الحوار نفسه الذي وراءها.",
  "latest.loading": "جارٍ تحميل أحدث الاستشهادات…",
  "latest.empty": "لا توجد استشهادات عامة بعد — اختم واحدًا وقد يظهر هنا.",
  "latest.notConfigured": "القائمة العامة غير متاحة على هذا الموقع بعد.",
  "latest.error": "تعذّر تحميل القائمة الآن. يرجى المحاولة مرة أخرى.",
  "latest.anon": "مجهول",
  "latest.viewAll": "عرض الكل",
  "latest.sealCta": "اختم محادثة",

  "footer.note": "دائم · مؤرّخ بالوقت · قابل للتحقق باستقلالية",
  "common.user": "المستخدم",
  "common.assistant": "المساعد",
};

// ─── Português ───────────────────────────────────────────────────────────────
const pt: Dict = {
  "brand.tagline": "Citações permanentes e verificáveis para suas conversas com AI",
  "nav.home": "Manifesto",
  "nav.mint": "Selar diálogo",
  "nav.verify": "Buscar",
  "nav.receipts": "Meus recibos",
  "nav.feedback": "Feedback",
  "nav.faq": "Perguntas frequentes",
  "nav.language": "Idioma",
  "cta.mint.title": "Para autores",
  "cta.mint.desc": "Guarde para sempre uma conversa que você teve com uma AI e obtenha uma citação para usar no seu trabalho.",
  "cta.mint.action": "Criar uma citação",
  "cta.verify.title": "Para leitores e revisores",
  "cta.verify.desc": "Digite qualquer código de citação e leia a conversa exata a que ele se refere.",
  "cta.verify.action": "Buscar uma citação",
  "home.eyebrow": "Atribuição honesta para a era da AI",
  "home.hero.title": "A AI te ajudou a pensar melhor. Agora, cite-a.",
  "home.hero.lede":
    "Cada vez mais pesquisa nasce de uma conversa com uma AI, mas essas conversas somem em silêncio, são editadas ou não podem ser comprovadas depois. O DeCite guarda uma conversa para sempre e te dá um código de citação curto para colocar no seu artigo ou livro. Qualquer pessoa pode depois buscá-lo e ler exatamente o que foi dito, e quando. Sem conta, sem pagamento e nada técnico para aprender.",
  "home.crisis.title": "Quando a conversa some, a prova também",
  "home.crisis.body":
    "Um link de chat compartilhado pode parar de funcionar, e uma plataforma pode editar ou apagar uma conversa a qualquer momento. Quando isso acontece, um revisor não pode mais checar o que foi perguntado, o que a AI respondeu ou quando aconteceu — e sua atribuição vira apenas a sua palavra. O DeCite torna a conversa permanente, para que ela sempre possa ser relida tal como foi, mesmo que a plataforma original já não exista.",
  "home.pillars.permanence.title": "Permanente",
  "home.pillars.permanence.body": "Depois de guardada, a conversa não pode ser editada nem retirada em silêncio — nem por nós, nem por ninguém.",
  "home.pillars.timestamp.title": "Com data e hora",
  "home.pillars.timestamp.body": "Cada citação registra a data e hora exatas em que foi guardada, então o momento nunca pode ser contestado.",
  "home.pillars.citation.title": "Fácil de citar",
  "home.pillars.citation.body": "Você recebe um código curto e limpo como DC-20260619-01 para colocar direto num artigo ou livro.",
  "home.quote": "Uma citação é a promessa de que a fonte pode ser encontrada. Apenas cumprimos a promessa.",
  "mint.title": "Selar um diálogo",
  "mint.subtitle": "Guarde a conversa para sempre e obtenha uma citação que você possa usar.",
  "mint.noWallet": "Nada técnico. O DeCite guarda e registra a conversa por você de forma permanente — é só colar e clicar em Selar.",
  "mint.freeLaunch": "Grátis no lançamento — sem conta, sem cartão. O DeCite guarda e registra sua conversa para sempre. Adicione seu e-mail e enviaremos a citação.",
  "mint.tab.link": "Link de compartilhamento oficial",
  "mint.tab.paste": "Colar texto direto",
  "mint.link.label": "Link de compartilhamento da AI",
  "mint.link.help": "Um link público oficial do ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen e outros. Algumas plataformas (ex.: Gemini, DeepSeek) escondem o chat de leitores externos — use Colar texto direto para elas.",
  "mint.paste.label": "Texto da conversa",
  "mint.paste.placeholder": "Cole a conversa aqui. Se puder, comece cada turno com 'User:' e 'Assistant:'.",
  "mint.paste.help": "Use quando a AI não oferecer um link público — guarda exatamente o que você cola.",
  "mint.originUrl.label": "Link da conversa original com a AI (opcional)",
  "mint.originUrl.help": "Cole o link do chat original (qualquer AI). Registra qual AI você usou e permite aos leitores abrir a fonte — enquanto o texto acima é o que é guardado.",
  "mint.originUrl.detected": "AI detectada: {provider} — será registrada com sua citação.",
  "mint.sourceRef.label": "Onde você vai usar (título da obra)",
  "mint.sourceRef.placeholder": "ex.: Sobre a ética do raciocínio sintético (2026), cap. 3",
  "mint.author.label": "Seu nome para a citação (opcional)",
  "mint.email.label": "E-mail (opcional)",
  "mint.email.help": "Enviaremos a citação para este e-mail e a guardaremos em Meus recibos para você achar depois.",
  "mint.step.pin": "Guardando a conversa num arquivo permanente",
  "mint.step.code": "Reservando seu código de citação",
  "mint.step.notarize": "Registrando no registro público",
  "mint.step.wait": "Isso leva alguns segundos — mantenha esta página aberta.",
  "mint.action.seal": "Selar e criar citação",
  "mint.action.sealing": "Selando…",
  "mint.action.sealFree": "Selar grátis",
  "mint.action.pay": "Pagar ${price} e selar",
  "mint.action.preparing": "Preparando o pagamento seguro…",
  "mint.pay.note": "Uma taxa única de ${price} cobre guardar e registrar sua conversa de forma permanente. O pagamento é tratado com segurança pela Stripe — nunca vemos nem armazenamos os dados do seu cartão.",
  "mint.canceled": "Pagamento cancelado. Sua conversa não foi guardada.",
  "mint.success.title": "Guardado e registrado",
  "mint.success.desc": "Sua conversa agora é permanente. Copie a citação abaixo para sua bibliografia.",
  "mint.success.code": "Código de citação",
  "mint.success.tx": "Registro público",
  "mint.success.apa": "Citação (estilo APA)",
  "mint.success.custodian": "Registrado permanentemente pelo DeCite em seu nome",
  "mint.copy": "Copiar",
  "mint.copied": "Copiado",
  "mint.viewVerify": "Abrir a página da citação",
  "mint.error.badLink": "Digite um link público válido de uma AI (ChatGPT, Claude, Grok, Perplexity e outros).",
  "mint.pasteOnlyHint": "O {provider} mantém a conversa dentro do seu navegador, então ela não pode ser lida a partir de um link. Abra sua conversa do {provider}, selecione tudo e copie, depois cole aqui — o DeCite guarda exatamente o que você cola.",
  "mint.switchToPaste": "Usar Colar texto direto",
  "mint.error.empty": "Adicione a conversa, por favor.",
  "mint.error.sourceRef": "Diga onde você vai usar, por favor.",
  "mint.warn.noContract": "Este site ainda não está pronto para selar.",
  "verify.title": "Buscar uma citação",
  "verify.subtitle": "Digite um código de citação e leia a conversa exata por trás dele.",
  "verify.input.placeholder": "Digite um código, ex.: DC-20260619-01",
  "verify.action": "Buscar",
  "verify.error.format": "Isso não parece um código de citação válido (DC-AAAAMMDD-NN).",
  "verify.error.notFound": "Nenhuma citação encontrada para este código.",
  "verify.error.config": "A busca ainda não está configurada neste site.",
  "verify.loading": "Buscando a citação…",
  "verify.sealed": "SELADO E VERIFICADO",
  "verify.meta.title": "Detalhes da citação",
  "verify.meta.timestamp": "Data do selo",
  "verify.meta.ai": "AI / Modelo",
  "verify.cite.title": "Pronta para citar",
  "verify.cite.help": "Copie esta referência direto para a bibliografia do seu artigo ou livro (estilo APA 7).",
  "verify.meta.authorName": "Autor",
  "verify.meta.custodian": "Selado por",
  "verify.meta.registry": "Registro público",
  "verify.meta.origin": "Como foi adicionado",
  "verify.meta.cid": "ID do arquivo",
  "verify.meta.code": "Código de citação",
  "verify.origin.link": "A conversa original com a AI",
  "verify.origin.open": "Abrir o original (site externo)",
  "verify.origin.warn": "Link externo — a plataforma original pode ter alterado ou removido esta conversa.",
  "verify.ipfs.title": "Arquivo permanente",
  "verify.ipfs.desc": "Leia direto do arquivo público permanente — disponível mesmo que a conversa original seja apagada.",
  "verify.ipfs.open": "Abrir o arquivo guardado",
  "verify.role.user": "Usuário",
  "verify.role.assistant": "Assistente",
  "verify.back": "Buscar outro código",
  "verify.perm.title": "Sempre acessível, mesmo sem o DeCite",
  "verify.perm.body": "Esta citação fica em dois lugares públicos independentes que nenhuma empresa controla: um registro público permanente e um arquivo público permanente. Qualquer pessoa pode abrir um ou outro diretamente, para sempre, mesmo que o site do DeCite venha a desaparecer. Aqui estão as duas formas de chegar a este mesmo registro sem nós.",
  "verify.perm.chain": "O registro público",
  "verify.perm.callHint": "Procure pelo seu código, {code}, no registro público:",
  "verify.perm.readOn": "Abrir o registro público",
  "verify.perm.ipfs": "O arquivo permanente",
  "verify.perm.ipfsHint": "Abra a conversa guardada a partir de qualquer cópia pública do arquivo:",
  "verify.perm.note": "O DeCite é só um jeito conveniente de ler tudo isso. A citação em si vive em infraestrutura pública independente e sobrevive sem nós.",
  "home.independent.title": "Suas citações não dependem de nós",
  "home.independent.body": "Cada citação é guardada em dois lugares públicos independentes que nenhuma empresa controla. Se o DeCite desaparecesse, suas referências continuariam legíveis e verificáveis por conta própria, para sempre — sem site, sem conta e sem permissão.",
  "home.independent.viewRegistry": "Ver o registro público",
  "success.error.title": "Não conseguimos terminar de selar sua conversa",
  "success.retry": "Voltar a selar",
  "success.sealAnother": "Selar outra conversa",
  "receipts.title": "Meus recibos",
  "receipts.subtitle": "Digite o e-mail usado ao selar para encontrar seus códigos de citação.",
  "receipts.action": "Buscar",
  "receipts.empty": "Nenhuma citação encontrada para este e-mail ainda.",
  "receipts.notConfigured": "Os recibos guardados ainda não estão disponíveis neste site.",
  "feedback.title": "Feedback e sugestões",
  "feedback.subtitle": "Diga-nos o que melhorar, relate um problema ou compartilhe uma ideia. Lemos tudo.",
  "feedback.type.label": "Que tipo de feedback?",
  "feedback.type.suggestion": "Sugestão",
  "feedback.type.bug": "Problema",
  "feedback.type.praise": "Elogio",
  "feedback.type.other": "Outro",
  "feedback.message.label": "Sua mensagem",
  "feedback.message.placeholder": "O que você tem em mente? Quanto mais específico, melhor.",
  "feedback.email.label": "E-mail (opcional)",
  "feedback.email.help": "Apenas se quiser uma resposta. Não o usaremos para mais nada.",
  "feedback.submit": "Enviar feedback",
  "feedback.sending": "Enviando…",
  "feedback.error.empty": "Digite uma mensagem.",
  "feedback.error.generic": "Algo deu errado. Tente novamente.",
  "feedback.thanks.title": "Obrigado!",
  "feedback.thanks.body": "Seu feedback foi recebido. Ele realmente ajuda a moldar o DeCite.",
  "feedback.thanks.again": "Enviar mais",
  "feedback.thanks.home": "Voltar ao início",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "Perguntas frequentes",
  "faq.subtitle":
    "Tudo sobre selar uma conversa com IA, citá-la e como a prova continua legível para sempre. Não encontrou sua pergunta? Envie pelo Feedback — respondemos a tudo.",
  "faq.group.about": "Sobre o DeCite",
  "faq.group.sealing": "Selar uma conversa",
  "faq.group.citation": "Sua citação",
  "faq.group.readers": "Para leitores e revisores",
  "faq.group.trust": "Permanência e confiança",
  "faq.group.privacy": "Privacidade e segurança",
  "faq.stillTitle": "Ainda tem uma pergunta?",
  "faq.stillBody":
    "Se nada aqui respondeu, pergunte diretamente a nós — lemos cada mensagem e costumamos responder em um dia.",
  "faq.stillCta": "Fazer uma pergunta",
  "faq.sealCta": "Selar um diálogo",

  "faq.q.what": "O que é o DeCite?",
  "faq.a.what":
    "O DeCite salva uma conversa que você teve com uma IA em um registro público permanente e lhe dá um código de citação curto — como DC-20260619-01 — que você pode colocar no seu artigo, livro ou publicação. Qualquer pessoa que tenha o código pode depois buscá-lo e ler a conversa exata, palavra por palavra, junto com a data e a hora em que foi salva. Ele transforma um bate-papo que poderia desaparecer em uma fonte que sempre pode ser verificada.",
  "faq.q.who": "Para quem é?",
  "faq.a.who":
    "Para qualquer pessoa cujo pensamento tomou forma em conversa com uma IA e que queira atribuí-lo com honestidade — pesquisadores, estudantes, autores, jornalistas e educadores. Autores o usam para criar um registro permanente e citável; leitores, revisores e editores o usam para verificar exatamente o que foi perguntado à IA e o que ela respondeu.",
  "faq.q.free": "É realmente grátis? Tem pegadinha?",
  "faq.a.free":
    "Selar é grátis durante o lançamento — sem conta, sem cartão, sem etapa oculta. Nós cobrimos o custo de salvar e registrar permanentemente cada conversa. Se isso um dia mudar, o preço será mostrado com clareza antes de você selar qualquer coisa, e as conversas já seladas permanecem seladas para sempre.",

  "faq.q.how": "Como selo uma conversa?",
  "faq.a.how":
    "Cole um link público de compartilhamento do seu bate-papo com a IA ou o próprio texto da conversa, adicione um título curto de onde você vai usá-la e clique em Selar. Em poucos segundos, o DeCite salva a conversa em um arquivo permanente, reserva o seu código de citação e a registra em um registro público. Você verá a citação na hora, e a enviaremos por e-mail se você adicionar seu endereço.",
  "faq.q.linkVsPaste": "Qual é a diferença entre «Link de compartilhamento oficial» e «Colar texto direto»?",
  "faq.a.linkVsPaste":
    "Use Link de compartilhamento oficial quando sua IA fornecer um link público que qualquer pessoa possa abrir — o DeCite lê a conversa a partir dele e salva uma cópia permanente. Use Colar texto direto quando não houver link público: você mesmo cola o texto da conversa e o DeCite salva exatamente o que você colar. Ambos produzem o mesmo tipo de registro permanente e citável.",
  "faq.q.platforms": "Quais plataformas de IA são compatíveis?",
  "faq.a.platforms":
    "Links públicos de compartilhamento funcionam com ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen e mais. Para qualquer IA que não ofereça um link público — ou para um bate-papo privado que você prefira colar — use Colar texto direto, que funciona com qualquer ferramenta, inclusive as que não estão nesta lista.",
  "faq.q.gemini": "Gemini ou DeepSeek não me dão um link público. O que faço?",
  "faq.a.gemini":
    "Algumas plataformas mantêm o bate-papo dentro do seu navegador, então um link não pode ser lido por leitores externos. Abra a conversa, selecione e copie o texto, depois mude para Colar texto direto e cole-o. O DeCite salva exatamente o que você colar. Você também pode adicionar o link do bate-papo original no campo opcional para que sua citação registre qual IA você usou.",
  "faq.q.account": "Preciso de conta, pagamento ou carteira de criptomoedas?",
  "faq.a.account":
    "Não. Não há cadastro, nem cartão, nem nada para instalar. Você não precisa de carteira nem de conhecimento técnico — o DeCite cuida de salvar e registrar para você nos bastidores. O e-mail é opcional e serve apenas para lhe enviar a citação e permitir que você a encontre de novo depois.",
  "faq.q.time": "Quanto tempo leva para selar?",
  "faq.a.time":
    "Normalmente só alguns segundos. Mantenha a página aberta enquanto ele trabalha — o DeCite está salvando a conversa em um arquivo permanente, reservando o seu código e registrando-a no registro público. Quando terminar, você verá sua citação imediatamente.",
  "faq.q.language": "Posso selar uma conversa em qualquer idioma?",
  "faq.a.language":
    "Sim. O DeCite salva o texto da conversa exatamente como está, em qualquer idioma e alfabeto. A própria interface está disponível em vários idiomas — troque a qualquer momento pelo menu de idioma na barra superior.",

  "faq.q.code": "Como é o código de citação?",
  "faq.a.code":
    "É um código curto e limpo no formato DC-AAAAMMDD-NN — por exemplo DC-20260619-01, ou seja, a primeira conversa selada em 19 de junho de 2026. É fácil de digitar numa bibliografia e fácil de um leitor buscar.",
  "faq.q.cite": "Como faço para citá-la no meu artigo ou livro?",
  "faq.a.cite":
    "Ao selar uma conversa, o DeCite lhe dá uma referência pronta no estilo APA 7 que você pode copiar direto para a sua bibliografia, junto com o código de citação e o link do registro público. Você tem liberdade para adaptá-la ao estilo que sua revista ou editora exigir.",
  "faq.q.edit": "Posso editar ou atualizar uma conversa depois de selá-la?",
  "faq.a.edit":
    "Não — e esse é justamente o ponto. Uma conversa selada não pode ser alterada por ninguém, nem por nós, e é exatamente isso que a torna confiável como citação. Se a conversa continuou ou você quer registrar uma versão mais recente, basta selá-la de novo para obter uma citação separada.",
  "faq.q.lost": "Perdi meu código de citação. Como o encontro de novo?",
  "faq.a.lost":
    "Se você adicionou seu e-mail ao selar, vá em Meus recibos e informe esse mesmo e-mail para ver todos os códigos de citação ligados a ele. Se não adicionou um e-mail, você precisará do próprio código para buscar a conversa — então guarde-o em lugar seguro.",

  "faq.q.lookup": "Como alguém busca minha citação?",
  "faq.a.lookup":
    "A pessoa vai à página Buscar, digita o código de citação, e a conversa selada exata se abre — o texto completo, a data e a hora em que foi selada, e qual IA foi usada. Não é preciso conta nem pagamento para lê-la.",
  "faq.q.readerAccount": "Leitores ou revisores precisam de conta para verificar?",
  "faq.a.readerAccount":
    "Não. Qualquer pessoa com o código pode ler a conversa, de graça e sem cadastro. Como o registro também fica em infraestrutura pública independente, um revisor determinado pode até verificá-lo sem usar o site do DeCite.",

  "faq.q.where": "Onde a conversa fica realmente armazenada?",
  "faq.a.where":
    "Em dois lugares públicos independentes que nenhuma empresa controla sozinha: um arquivo público permanente que guarda a conversa completa e um registro público que anota seu código de citação e o momento em que foi selada. O DeCite é só uma janela conveniente para ambos — o registro não depende de nós para existir.",
  "faq.q.ifGone": "O que acontece se o DeCite um dia desaparecer?",
  "faq.a.ifGone":
    "Suas citações continuam funcionando. Como cada uma fica armazenada em infraestrutura pública independente, qualquer pessoa ainda pode abrir diretamente o registro público e o arquivo permanente — sem site, sem conta e sem precisar de permissão. A prova sobrevive à empresa.",
  "faq.q.timestamp": "Como sei que a data e a hora são confiáveis?",
  "faq.a.timestamp":
    "Quando uma conversa é selada, a data e a hora exatas são gravadas em um registro público que não pode ser alterado às escondidas depois. Assim, o horário não é só a nossa palavra — qualquer pessoa pode verificá-lo de forma independente, e é isso que o faz resistir ao escrutínio.",

  "faq.q.public": "A conversa selada é pública? Quem pode vê-la?",
  "faq.a.public":
    "Sim. Uma conversa selada existe para ser citável, então qualquer pessoa que tenha o código de citação pode lê-la, e ela permanece pública para sempre. Sele apenas conversas que você se sinta à vontade de tornar públicas para sempre.",
  "faq.q.sensitive": "E as informações pessoais ou confidenciais no bate-papo?",
  "faq.a.sensitive":
    "Como selar é permanente e público, remova qualquer coisa privada ou sensível — nomes, dados de contato, dados não publicados, qualquer informação confidencial — antes de selar. Depois de selada, a conversa não pode ser editada nem retirada, então revise o texto com cuidado antes.",
  "faq.q.email": "Vocês armazenam meu e-mail e para quê?",
  "faq.a.email":
    "O e-mail é opcional. Se você fornecer um, nós o usamos apenas para lhe enviar sua citação e para você reencontrar seus códigos em Meus recibos. Ele não faz parte do registro público e não o usamos para mais nada.",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "Recentes",
  "nav.more": "Mais",
  "mint.share.label": "Incluir na lista pública «Citações recentes»",
  "mint.share.help":
    "Ativado por padrão. Qualquer pessoa com o código já pode ler uma citação selada; isto apenas a lista publicamente para que outros a descubram. Desative para mantê-la fora da lista.",
  "latest.title": "Citações recentes",
  "latest.subtitle":
    "Conversas seladas recentemente que os autores escolheram compartilhar publicamente. Abra qualquer uma para ler o diálogo exato por trás dela.",
  "latest.loading": "Carregando as citações recentes…",
  "latest.empty": "Ainda não há citações públicas — sele uma e ela poderá aparecer aqui.",
  "latest.notConfigured": "A lista pública ainda não está disponível neste site.",
  "latest.error": "Não foi possível carregar a lista agora. Tente novamente.",
  "latest.anon": "Anônimo",
  "latest.viewAll": "Ver todas",
  "latest.sealCta": "Selar um diálogo",

  "footer.note": "Permanente · Com data e hora · Verificável de forma independente",
  "common.user": "Usuário",
  "common.assistant": "Assistente",
};

// ─── Русский ─────────────────────────────────────────────────────────────────
const ru: Dict = {
  "brand.tagline": "Постоянные, проверяемые ссылки на ваши разговоры с AI",
  "nav.home": "Манифест",
  "nav.mint": "Запечатать диалог",
  "nav.verify": "Найти",
  "nav.receipts": "Мои квитанции",
  "nav.feedback": "Отзывы",
  "nav.faq": "Вопросы и ответы",
  "nav.language": "Язык",
  "cta.mint.title": "Для авторов",
  "cta.mint.desc": "Навсегда сохраните разговор с AI и получите ссылку, которую можно вставить в свою работу.",
  "cta.mint.action": "Создать ссылку",
  "cta.verify.title": "Для читателей и рецензентов",
  "cta.verify.desc": "Введите любой код ссылки и прочитайте именно тот разговор, к которому он относится.",
  "cta.verify.action": "Найти ссылку",
  "home.eyebrow": "Честное авторство в эпоху AI",
  "home.hero.title": "AI помог вам всё продумать. Теперь сошлитесь на него.",
  "home.hero.lede":
    "Всё больше исследований рождается в разговоре с AI — но эти разговоры тихо исчезают, меняются или их потом невозможно подтвердить. DeCite сохраняет разговор навсегда и даёт вам короткий код ссылки для статьи или книги. Любой затем сможет его найти и прочитать, что именно было сказано и когда. Без аккаунта, без оплаты и без всего технического.",
  "home.crisis.title": "Исчезает разговор — исчезает и доказательство",
  "home.crisis.body":
    "Ссылка на общий чат может перестать работать, а платформа может изменить или удалить разговор в любой момент. Тогда рецензент уже не сможет проверить, что было спрошено, что ответил AI и когда это было, — и ваше авторство остаётся лишь на словах. DeCite делает разговор постоянным, чтобы его всегда можно было прочитать в точности таким, каким он был, даже если исходной платформы давно нет.",
  "home.pillars.permanence.title": "Навсегда",
  "home.pillars.permanence.body": "Однажды сохранённый разговор нельзя изменить или тихо убрать — ни нам, ни кому-либо ещё.",
  "home.pillars.timestamp.title": "С отметкой времени",
  "home.pillars.timestamp.body": "Каждая ссылка фиксирует точную дату и время сохранения, поэтому момент невозможно оспорить.",
  "home.pillars.citation.title": "Легко цитировать",
  "home.pillars.citation.body": "Вы получаете короткий, аккуратный код вида DC-20260619-01 для вставки прямо в статью или книгу.",
  "home.quote": "Ссылка — это обещание, что источник можно найти. Мы просто держим обещание.",
  "mint.title": "Запечатать диалог",
  "mint.subtitle": "Сохраните разговор навсегда и получите ссылку, на которую можно сослаться.",
  "mint.noWallet": "Ничего технического. DeCite сохраняет и навсегда регистрирует разговор за вас — просто вставьте его и нажмите «Запечатать».",
  "mint.freeLaunch": "Бесплатно на старте — без аккаунта и карты. DeCite навсегда сохраняет и регистрирует ваш разговор. Укажите e-mail, и мы пришлём вам ссылку.",
  "mint.tab.link": "Официальная ссылка",
  "mint.tab.paste": "Вставить текст",
  "mint.link.label": "Ссылка на разговор с AI",
  "mint.link.help": "Официальная публичная ссылка из ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen и других. Некоторые платформы (напр. Gemini, DeepSeek) скрывают чат от посторонних — для них используйте «Вставить текст».",
  "mint.paste.label": "Текст разговора",
  "mint.paste.placeholder": "Вставьте сюда разговор. По возможности начинайте реплики с 'User:' и 'Assistant:'.",
  "mint.paste.help": "Используйте, когда у AI нет публичной ссылки — сохраняется ровно то, что вы вставили.",
  "mint.originUrl.label": "Ссылка на исходный разговор с AI (необязательно)",
  "mint.originUrl.help": "Вставьте ссылку на исходный чат (любой AI). Она фиксирует, какой AI вы использовали, и позволяет читателям открыть источник, тогда как сохраняется текст выше.",
  "mint.originUrl.detected": "Обнаружен AI: {provider} — будет записан вместе с вашей ссылкой.",
  "mint.sourceRef.label": "Где вы это используете (название работы)",
  "mint.sourceRef.placeholder": "напр. Об этике синтетического рассуждения (2026), гл. 3",
  "mint.author.label": "Ваше имя для ссылки (необязательно)",
  "mint.email.label": "E-mail (необязательно)",
  "mint.email.help": "Мы пришлём ссылку на этот e-mail и сохраним её в «Моих квитанциях», чтобы вы нашли её позже.",
  "mint.step.pin": "Сохраняем разговор в постоянный архив",
  "mint.step.code": "Резервируем ваш код ссылки",
  "mint.step.notarize": "Регистрируем в публичном реестре",
  "mint.step.wait": "Это займёт несколько секунд — не закрывайте страницу.",
  "mint.action.seal": "Запечатать и создать ссылку",
  "mint.action.sealing": "Запечатывание…",
  "mint.action.sealFree": "Запечатать бесплатно",
  "mint.action.pay": "Оплатить ${price} и запечатать",
  "mint.action.preparing": "Подготовка безопасной оплаты…",
  "mint.pay.note": "Разовая плата ${price} покрывает сохранение и постоянную регистрацию вашего разговора. Оплату безопасно обрабатывает Stripe — мы никогда не видим и не храним данные вашей карты.",
  "mint.canceled": "Оплата отменена. Ваш разговор не сохранён.",
  "mint.success.title": "Сохранено и зарегистрировано",
  "mint.success.desc": "Ваш разговор теперь постоянный. Скопируйте ссылку ниже для библиографии.",
  "mint.success.code": "Код ссылки",
  "mint.success.tx": "Публичная запись",
  "mint.success.apa": "Ссылка (стиль APA)",
  "mint.success.custodian": "Постоянно зарегистрировано DeCite от вашего имени",
  "mint.copy": "Копировать",
  "mint.copied": "Скопировано",
  "mint.viewVerify": "Открыть страницу ссылки",
  "mint.error.badLink": "Введите корректную публичную ссылку AI (ChatGPT, Claude, Grok, Perplexity и др.).",
  "mint.pasteOnlyHint": "{provider} держит разговор внутри вашего браузера, поэтому его нельзя прочитать по ссылке. Откройте чат {provider}, выделите всё и скопируйте, затем вставьте сюда — DeCite сохраняет ровно то, что вы вставили.",
  "mint.switchToPaste": "Использовать «Вставить текст»",
  "mint.error.empty": "Пожалуйста, добавьте разговор.",
  "mint.error.sourceRef": "Пожалуйста, укажите, где вы это используете.",
  "mint.warn.noContract": "Этот сайт ещё не готов к запечатыванию.",
  "verify.title": "Найти ссылку",
  "verify.subtitle": "Введите код ссылки и прочитайте именно тот разговор, что за ним стоит.",
  "verify.input.placeholder": "Введите код, напр. DC-20260619-01",
  "verify.action": "Найти",
  "verify.error.format": "Это не похоже на корректный код ссылки (DC-ГГГГММДД-NN).",
  "verify.error.notFound": "По этому коду ссылка не найдена.",
  "verify.error.config": "Поиск на этом сайте ещё не настроен.",
  "verify.loading": "Ищем ссылку…",
  "verify.sealed": "ЗАПЕЧАТАНО И ПРОВЕРЕНО",
  "verify.meta.title": "Сведения о ссылке",
  "verify.meta.timestamp": "Дата запечатывания",
  "verify.meta.ai": "AI / Модель",
  "verify.cite.title": "Готово к цитированию",
  "verify.cite.help": "Скопируйте эту ссылку прямо в библиографию статьи или книги (стиль APA 7).",
  "verify.meta.authorName": "Автор",
  "verify.meta.custodian": "Запечатал",
  "verify.meta.registry": "Публичный реестр",
  "verify.meta.origin": "Как добавлено",
  "verify.meta.cid": "ID архива",
  "verify.meta.code": "Код ссылки",
  "verify.origin.link": "Исходный разговор с AI",
  "verify.origin.open": "Открыть оригинал (внешний сайт)",
  "verify.origin.warn": "Внешняя ссылка — исходная платформа могла изменить или удалить этот разговор.",
  "verify.ipfs.title": "Постоянный архив",
  "verify.ipfs.desc": "Читайте прямо из постоянного публичного архива — доступно, даже если исходный разговор удалён.",
  "verify.ipfs.open": "Открыть сохранённый файл",
  "verify.role.user": "Пользователь",
  "verify.role.assistant": "Ассистент",
  "verify.back": "Найти другой код",
  "verify.perm.title": "Доступно всегда — даже без DeCite",
  "verify.perm.body": "Эта ссылка хранится в двух независимых публичных местах, не контролируемых ни одной компанией: в постоянном публичном реестре и в постоянном публичном архиве. Любой может открыть любое из них напрямую и навсегда — даже если сайт DeCite когда-нибудь исчезнет. Ниже — два способа добраться до этой же записи без нас.",
  "verify.perm.chain": "Публичный реестр",
  "verify.perm.callHint": "Найдите ваш код, {code}, в публичном реестре:",
  "verify.perm.readOn": "Открыть публичный реестр",
  "verify.perm.ipfs": "Постоянный архив",
  "verify.perm.ipfsHint": "Откройте сохранённый разговор из любой публичной копии архива:",
  "verify.perm.note": "DeCite — лишь удобный способ всё это прочитать. Сама ссылка находится на независимой публичной инфраструктуре и сохраняется без нас.",
  "home.independent.title": "Ваши ссылки не зависят от нас",
  "home.independent.body": "Каждая ссылка хранится в двух независимых публичных местах, не контролируемых ни одной компанией. Если DeCite исчезнет, ваши ссылки останутся читаемыми и проверяемыми сами по себе и навсегда — без сайта, без аккаунта и без разрешений.",
  "home.independent.viewRegistry": "Посмотреть публичный реестр",
  "success.error.title": "Не удалось завершить запечатывание разговора",
  "success.retry": "Назад к запечатыванию",
  "success.sealAnother": "Запечатать другой разговор",
  "receipts.title": "Мои квитанции",
  "receipts.subtitle": "Введите e-mail, использованный при запечатывании, чтобы найти коды ссылок.",
  "receipts.action": "Найти",
  "receipts.empty": "По этому e-mail ссылок пока не найдено.",
  "receipts.notConfigured": "Сохранённые квитанции на этом сайте пока недоступны.",
  "feedback.title": "Отзывы и предложения",
  "feedback.subtitle": "Расскажите, что улучшить, сообщите о проблеме или поделитесь идеей. Мы читаем всё.",
  "feedback.type.label": "Какой тип отзыва?",
  "feedback.type.suggestion": "Предложение",
  "feedback.type.bug": "Проблема",
  "feedback.type.praise": "Похвала",
  "feedback.type.other": "Другое",
  "feedback.message.label": "Ваше сообщение",
  "feedback.message.placeholder": "Что у вас на уме? Чем конкретнее, тем лучше.",
  "feedback.email.label": "E-mail (необязательно)",
  "feedback.email.help": "Только если хотите ответ. Мы не используем его ни для чего другого.",
  "feedback.submit": "Отправить отзыв",
  "feedback.sending": "Отправка…",
  "feedback.error.empty": "Введите сообщение.",
  "feedback.error.generic": "Что-то пошло не так. Попробуйте ещё раз.",
  "feedback.thanks.title": "Спасибо!",
  "feedback.thanks.body": "Ваш отзыв получен. Он действительно помогает развивать DeCite.",
  "feedback.thanks.again": "Отправить ещё",
  "feedback.thanks.home": "На главную",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "Частые вопросы",
  "faq.subtitle":
    "Всё о том, как запечатать разговор с ИИ, сослаться на него и почему доказательство остаётся читаемым навсегда. Не нашли свой вопрос? Пришлите его через «Отзывы» — мы отвечаем на всё.",
  "faq.group.about": "О DeCite",
  "faq.group.sealing": "Как запечатать разговор",
  "faq.group.citation": "Ваша ссылка",
  "faq.group.readers": "Для читателей и рецензентов",
  "faq.group.trust": "Постоянство и доверие",
  "faq.group.privacy": "Конфиденциальность и безопасность",
  "faq.stillTitle": "Остался вопрос?",
  "faq.stillBody":
    "Если здесь нет ответа, спросите нас напрямую — мы читаем каждое сообщение и обычно отвечаем в течение дня.",
  "faq.stillCta": "Задать вопрос",
  "faq.sealCta": "Запечатать диалог",

  "faq.q.what": "Что такое DeCite?",
  "faq.a.what":
    "DeCite сохраняет ваш разговор с ИИ в постоянную публичную запись и выдаёт короткий код ссылки — например DC-20260619-01, — который можно вставить в вашу статью, книгу или публикацию. Любой, у кого есть этот код, сможет затем найти его и прочитать тот самый разговор слово в слово, вместе с датой и временем сохранения. Так разговор, который мог бы исчезнуть, превращается в источник, который всегда можно проверить.",
  "faq.q.who": "Для кого это?",
  "faq.a.who":
    "Для всех, чья мысль сложилась в разговоре с ИИ и кто хочет честно указать источник, — исследователей, студентов, авторов, журналистов и преподавателей. Авторы используют это, чтобы создать постоянную запись, на которую можно сослаться; читатели, рецензенты и редакторы — чтобы проверить, что именно спрашивали у ИИ и что он ответил.",
  "faq.q.free": "Это правда бесплатно? В чём подвох?",
  "faq.a.free":
    "На время запуска запечатывание бесплатно — без аккаунта, без карты, без скрытых шагов. Расходы на сохранение и постоянную регистрацию каждого разговора мы берём на себя. Если это когда-нибудь изменится, цена будет ясно показана прежде, чем вы что-либо запечатаете, а уже запечатанные разговоры останутся запечатанными навсегда.",

  "faq.q.how": "Как запечатать разговор?",
  "faq.a.how":
    "Вставьте либо публичную ссылку на ваш чат с ИИ, либо сам текст разговора, добавьте короткое название того, где вы его используете, и нажмите «Запечатать». За несколько секунд DeCite сохраняет разговор в постоянный архив, резервирует ваш код ссылки и заносит его в публичный реестр. Ссылку вы увидите сразу, а если укажете адрес — мы отправим её вам на почту.",
  "faq.q.linkVsPaste": "В чём разница между «Официальной ссылкой» и «Вставить текст»?",
  "faq.a.linkVsPaste":
    "Используйте «Официальную ссылку», когда ИИ даёт публичную ссылку, которую может открыть любой, — DeCite читает по ней разговор и сохраняет постоянную копию. Используйте «Вставить текст», когда публичной ссылки нет: вы сами вставляете текст разговора, и DeCite сохраняет ровно то, что вы вставили. Оба способа дают одинаковую постоянную запись, на которую можно сослаться.",
  "faq.q.platforms": "Какие платформы ИИ поддерживаются?",
  "faq.a.platforms":
    "Публичные ссылки работают из ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen и других. Для любого ИИ, который не даёт публичной ссылки, — или для приватного чата, который вы предпочтёте вставить, — используйте «Вставить текст»: он работает с любым инструментом, в том числе с теми, что не в этом списке.",
  "faq.q.gemini": "Gemini или DeepSeek не дают мне публичной ссылки. Что делать?",
  "faq.a.gemini":
    "Некоторые платформы держат чат внутри вашего браузера, поэтому по ссылке его не прочитают сторонние читатели. Откройте разговор, выделите и скопируйте текст, затем перейдите на «Вставить текст» и вставьте его. DeCite сохраняет ровно то, что вы вставили. Можно также указать ссылку на исходный чат в необязательном поле, чтобы в вашей записи отметилось, каким ИИ вы пользовались.",
  "faq.q.account": "Нужны ли аккаунт, оплата или криптокошелёк?",
  "faq.a.account":
    "Нет. Никакой регистрации, никакой карты и ничего устанавливать. Вам не нужны ни кошелёк, ни технические знания — DeCite берёт сохранение и регистрацию на себя за кулисами. Электронная почта необязательна и используется только чтобы прислать вам ссылку и дать найти её позже.",
  "faq.q.time": "Сколько занимает запечатывание?",
  "faq.a.time":
    "Обычно всего несколько секунд. Пока идёт работа, держите страницу открытой — DeCite сохраняет разговор в постоянный архив, резервирует ваш код и заносит его в публичный реестр. Как только всё готово, вы сразу увидите свою ссылку.",
  "faq.q.language": "Можно ли запечатать разговор на любом языке?",
  "faq.a.language":
    "Да. DeCite сохраняет текст разговора точно как есть, на любом языке и в любой письменности. Сам интерфейс доступен на нескольких языках — переключите его в любой момент в меню языка в верхней панели.",

  "faq.q.code": "Как выглядит код ссылки?",
  "faq.a.code":
    "Это короткий и понятный код вида DC-ГГГГММДД-NN — например DC-20260619-01, то есть первый разговор, запечатанный 19 июня 2026 года. Его легко вписать в список литературы и легко найти читателю.",
  "faq.q.cite": "Как сослаться на это в статье или книге?",
  "faq.a.cite":
    "Когда вы запечатываете разговор, DeCite даёт готовую ссылку в стиле APA 7, которую можно скопировать прямо в список литературы, вместе с кодом ссылки и адресом публичной записи. Вы вправе адаптировать её под любой стиль, который требует ваш журнал или издатель.",
  "faq.q.edit": "Можно ли изменить или обновить разговор после запечатывания?",
  "faq.a.edit":
    "Нет — и в этом весь смысл. Запечатанный разговор не может изменить никто, включая нас, и именно это делает его надёжным как ссылку. Если разговор продолжился или вы хотите зафиксировать более новую версию, просто запечатайте его снова и получите отдельную ссылку.",
  "faq.q.lost": "Я потерял код ссылки. Как найти его снова?",
  "faq.a.lost":
    "Если при запечатывании вы указали почту, зайдите в «Мои квитанции» и введите тот же адрес, чтобы увидеть все привязанные к нему коды ссылок. Если почту вы не указывали, для поиска разговора понадобится сам код — поэтому храните его в надёжном месте.",

  "faq.q.lookup": "Как кто-то находит мою ссылку?",
  "faq.a.lookup":
    "Он заходит на страницу «Найти», вводит код ссылки — и открывается тот самый запечатанный разговор: полный текст, дата и время запечатывания и какой ИИ использовался. Чтобы прочитать его, не нужны ни аккаунт, ни оплата.",
  "faq.q.readerAccount": "Нужен ли читателям или рецензентам аккаунт для проверки?",
  "faq.a.readerAccount":
    "Нет. Любой, у кого есть код, может прочитать разговор бесплатно и без регистрации. Поскольку запись хранится ещё и на независимой публичной инфраструктуре, дотошный рецензент может проверить её даже вовсе не пользуясь сайтом DeCite.",

  "faq.q.where": "Где на самом деле хранится разговор?",
  "faq.a.where":
    "В двух независимых публичных местах, которые не контролирует ни одна отдельная компания: в постоянном публичном архиве, где лежит весь разговор, и в публичном реестре, который фиксирует его код ссылки и момент запечатывания. DeCite — лишь удобное окно к обоим; существование записи от нас не зависит.",
  "faq.q.ifGone": "Что будет, если DeCite когда-нибудь исчезнет?",
  "faq.a.ifGone":
    "Ваши ссылки продолжат работать. Поскольку каждая хранится на независимой публичной инфраструктуре, любой по-прежнему сможет напрямую открыть публичный реестр и постоянный архив — без сайта, без аккаунта и без разрешений. Доказательство переживает компанию.",
  "faq.q.timestamp": "Как узнать, что дате и времени можно доверять?",
  "faq.a.timestamp":
    "Когда разговор запечатывается, точная дата и время записываются в публичный реестр, который потом нельзя незаметно изменить. Поэтому время — не просто наше слово: любой может проверить его независимо, и именно это позволяет ему выдержать придирчивую проверку.",

  "faq.q.public": "Запечатанный разговор публичный? Кто может его видеть?",
  "faq.a.public":
    "Да. Запечатанный разговор предназначен для цитирования, поэтому любой, у кого есть код ссылки, может его прочитать, и он остаётся публичным навсегда. Запечатывайте только те разговоры, которые вам спокойно сделать публичными навсегда.",
  "faq.q.sensitive": "А как насчёт личной или конфиденциальной информации в чате?",
  "faq.a.sensitive":
    "Поскольку запечатывание постоянно и публично, перед ним уберите всё личное или чувствительное — имена, контакты, неопубликованные данные, любую конфиденциальную информацию. После запечатывания разговор нельзя ни изменить, ни снять, поэтому сначала внимательно просмотрите текст.",
  "faq.q.email": "Вы храните мою почту и зачем?",
  "faq.a.email":
    "Почта необязательна. Если вы её укажете, мы используем её только чтобы прислать вам вашу ссылку и дать вам снова найти ваши коды в «Моих квитанциях». Она не входит в публичную запись, и больше ни для чего мы её не используем.",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "Последние",
  "nav.more": "Ещё",
  "mint.share.label": "Добавить в публичный список «Последние ссылки»",
  "mint.share.help":
    "Включено по умолчанию. Любой, у кого есть код, и так может прочитать запечатанную ссылку; эта настройка лишь публично перечисляет её, чтобы другие могли её найти. Выключите, чтобы не показывать её в списке.",
  "latest.title": "Последние ссылки",
  "latest.subtitle":
    "Недавно запечатанные разговоры, которые авторы решили опубликовать. Откройте любой, чтобы прочитать сам разговор за ним.",
  "latest.loading": "Загрузка последних ссылок…",
  "latest.empty": "Публичных ссылок пока нет — запечатайте одну, и она сможет появиться здесь.",
  "latest.notConfigured": "Публичный список на этом сайте пока недоступен.",
  "latest.error": "Сейчас не удалось загрузить список. Попробуйте ещё раз.",
  "latest.anon": "Аноним",
  "latest.viewAll": "Показать все",
  "latest.sealCta": "Запечатать диалог",

  "footer.note": "Навсегда · С отметкой времени · Проверяемо независимо",
  "common.user": "Пользователь",
  "common.assistant": "Ассистент",
};

// ─── Deutsch ─────────────────────────────────────────────────────────────────
const de: Dict = {
  "brand.tagline": "Dauerhafte, überprüfbare Zitate für deine Gespräche mit AI",
  "nav.home": "Manifest",
  "nav.mint": "Dialog versiegeln",
  "nav.verify": "Suchen",
  "nav.receipts": "Meine Belege",
  "nav.feedback": "Feedback",
  "nav.faq": "Häufige Fragen",
  "nav.language": "Sprache",
  "cta.mint.title": "Für Autorinnen und Autoren",
  "cta.mint.desc": "Sichere ein Gespräch, das du mit einer AI geführt hast, dauerhaft und erhalte ein Zitat für deine Arbeit.",
  "cta.mint.action": "Zitat erstellen",
  "cta.verify.title": "Für Lesende und Gutachtende",
  "cta.verify.desc": "Gib einen Zitatcode ein und lies genau das Gespräch, auf das er sich bezieht.",
  "cta.verify.action": "Zitat nachschlagen",
  "home.eyebrow": "Ehrliche Zuschreibung im Zeitalter der AI",
  "home.hero.title": "Die AI half dir, es zu durchdenken. Jetzt zitiere sie.",
  "home.hero.lede":
    "Immer mehr Forschung entsteht im Gespräch mit einer AI — doch diese Gespräche verschwinden still, werden geändert oder lassen sich später nicht belegen. DeCite sichert ein Gespräch dauerhaft und gibt dir einen kurzen Zitatcode für deinen Aufsatz oder dein Buch. Jede Person kann ihn danach nachschlagen und genau lesen, was gesagt wurde, und wann. Ohne Konto, ohne Bezahlung und ohne etwas Technisches zu lernen.",
  "home.crisis.title": "Verschwindet das Gespräch, verschwindet der Beleg",
  "home.crisis.body":
    "Ein geteilter Chat-Link kann aufhören zu funktionieren, und eine Plattform kann ein Gespräch jederzeit ändern oder löschen. Dann kann ein Gutachter nicht mehr prüfen, was gefragt wurde, was die AI antwortete oder wann es war — und deine Zuschreibung steht nur noch auf deinem Wort. DeCite macht das Gespräch dauerhaft, sodass es immer genau so nachgelesen werden kann, wie es war, selbst wenn die ursprüngliche Plattform längst weg ist.",
  "home.pillars.permanence.title": "Dauerhaft",
  "home.pillars.permanence.body": "Einmal gesichert, kann das Gespräch nicht geändert oder still entfernt werden — weder von uns noch von irgendwem.",
  "home.pillars.timestamp.title": "Mit Zeitstempel",
  "home.pillars.timestamp.body": "Jedes Zitat hält das genaue Datum und die Uhrzeit der Sicherung fest, sodass der Zeitpunkt nie bestreitbar ist.",
  "home.pillars.citation.title": "Leicht zu zitieren",
  "home.pillars.citation.body": "Du erhältst einen kurzen, sauberen Code wie DC-20260619-01 — direkt für Aufsatz oder Buch.",
  "home.quote": "Ein Zitat ist das Versprechen, dass die Quelle gefunden werden kann. Wir halten das Versprechen einfach ein.",
  "mint.title": "Dialog versiegeln",
  "mint.subtitle": "Sichere das Gespräch dauerhaft und erhalte ein zitierfähiges Zitat.",
  "mint.noWallet": "Nichts Technisches. DeCite sichert und registriert das Gespräch dauerhaft für dich — einfach einfügen und auf Versiegeln klicken.",
  "mint.freeLaunch": "Zum Start kostenlos — kein Konto, keine Karte. DeCite sichert und registriert dein Gespräch dauerhaft. Gib deine E-Mail an, und wir senden dir das Zitat.",
  "mint.tab.link": "Offizieller Freigabelink",
  "mint.tab.paste": "Text einfügen",
  "mint.link.label": "AI-Freigabelink",
  "mint.link.help": "Ein offizieller öffentlicher Freigabelink von ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen u. a. Manche Plattformen (z. B. Gemini, DeepSeek) verbergen das Gespräch vor externen Lesenden — nutze dafür „Text einfügen“.",
  "mint.paste.label": "Gesprächstext",
  "mint.paste.placeholder": "Füge das Gespräch hier ein. Beginne Beiträge nach Möglichkeit mit 'User:' und 'Assistant:'.",
  "mint.paste.help": "Nutze dies, wenn die AI keinen öffentlichen Link bietet — gesichert wird genau das, was du einfügst.",
  "mint.originUrl.label": "Link zum ursprünglichen AI-Gespräch (optional)",
  "mint.originUrl.help": "Füge den Link zum ursprünglichen Chat ein (beliebige AI). Er hält fest, welche AI du genutzt hast, und lässt Lesende die Quelle öffnen — während der Text oben das ist, was gesichert wird.",
  "mint.originUrl.detected": "Erkannte AI: {provider} — wird mit deinem Zitat festgehalten.",
  "mint.sourceRef.label": "Wo du es verwendest (Werktitel)",
  "mint.sourceRef.placeholder": "z. B. Zur Ethik des synthetischen Schließens (2026), Kap. 3",
  "mint.author.label": "Dein Name für das Zitat (optional)",
  "mint.email.label": "E-Mail (optional)",
  "mint.email.help": "Wir senden dir das Zitat an diese E-Mail und legen es unter „Meine Belege“ ab, damit du es später findest.",
  "mint.step.pin": "Gespräch wird in einem dauerhaften Archiv gesichert",
  "mint.step.code": "Dein Zitatcode wird reserviert",
  "mint.step.notarize": "Eintragung in das öffentliche Register",
  "mint.step.wait": "Das dauert ein paar Sekunden — bitte lass diese Seite offen.",
  "mint.action.seal": "Versiegeln & Zitat erstellen",
  "mint.action.sealing": "Wird versiegelt…",
  "mint.action.sealFree": "Kostenlos versiegeln",
  "mint.action.pay": "${price} zahlen & versiegeln",
  "mint.action.preparing": "Sichere Kasse wird vorbereitet…",
  "mint.pay.note": "Eine einmalige Gebühr von ${price} deckt das dauerhafte Sichern und Registrieren deines Gesprächs. Die Zahlung wickelt Stripe sicher ab — wir sehen oder speichern deine Kartendaten nie.",
  "mint.canceled": "Bezahlung abgebrochen. Dein Gespräch wurde nicht gesichert.",
  "mint.success.title": "Gesichert & registriert",
  "mint.success.desc": "Dein Gespräch ist nun dauerhaft. Kopiere das Zitat unten für dein Literaturverzeichnis.",
  "mint.success.code": "Zitatcode",
  "mint.success.tx": "Öffentlicher Eintrag",
  "mint.success.apa": "Zitat (APA-Stil)",
  "mint.success.custodian": "Dauerhaft von DeCite in deinem Namen registriert",
  "mint.copy": "Kopieren",
  "mint.copied": "Kopiert",
  "mint.viewVerify": "Die Zitatseite öffnen",
  "mint.error.badLink": "Gib einen gültigen öffentlichen AI-Freigabelink ein (ChatGPT, Claude, Grok, Perplexity u. a.).",
  "mint.pasteOnlyHint": "{provider} hält das Gespräch in deinem Browser, daher kann es nicht über einen Link gelesen werden. Öffne deinen {provider}-Chat, alles markieren und kopieren, dann hier einfügen — DeCite sichert genau das, was du einfügst.",
  "mint.switchToPaste": "„Text einfügen“ verwenden",
  "mint.error.empty": "Bitte füge das Gespräch hinzu.",
  "mint.error.sourceRef": "Bitte gib an, wo du es verwendest.",
  "mint.warn.noContract": "Diese Seite ist noch nicht bereit zum Versiegeln.",
  "verify.title": "Ein Zitat nachschlagen",
  "verify.subtitle": "Gib einen Zitatcode ein und lies genau das Gespräch dahinter.",
  "verify.input.placeholder": "Code eingeben, z. B. DC-20260619-01",
  "verify.action": "Nachschlagen",
  "verify.error.format": "Das sieht nicht nach einem gültigen Zitatcode aus (DC-JJJJMMTT-NN).",
  "verify.error.notFound": "Für diesen Code wurde kein Zitat gefunden.",
  "verify.error.config": "Die Suche ist auf dieser Seite noch nicht eingerichtet.",
  "verify.loading": "Zitat wird gesucht…",
  "verify.sealed": "VERSIEGELT & VERIFIZIERT",
  "verify.meta.title": "Zitat-Details",
  "verify.meta.timestamp": "Datum des Versiegelns",
  "verify.meta.ai": "AI / Modell",
  "verify.cite.title": "Zitierfertig",
  "verify.cite.help": "Kopiere diesen Nachweis direkt in das Literaturverzeichnis deines Aufsatzes oder Buches (APA-7-Stil).",
  "verify.meta.authorName": "Autor",
  "verify.meta.custodian": "Versiegelt von",
  "verify.meta.registry": "Öffentliches Register",
  "verify.meta.origin": "Wie hinzugefügt",
  "verify.meta.cid": "Archiv-ID",
  "verify.meta.code": "Zitatcode",
  "verify.origin.link": "Das ursprüngliche AI-Gespräch",
  "verify.origin.open": "Original öffnen (externe Seite)",
  "verify.origin.warn": "Externer Link — die ursprüngliche Plattform hat dieses Gespräch möglicherweise geändert oder entfernt.",
  "verify.ipfs.title": "Dauerhaftes Archiv",
  "verify.ipfs.desc": "Lies direkt aus dem dauerhaften öffentlichen Archiv — verfügbar, selbst wenn das ursprüngliche Gespräch gelöscht wird.",
  "verify.ipfs.open": "Gesicherte Datei öffnen",
  "verify.role.user": "Nutzer",
  "verify.role.assistant": "Assistent",
  "verify.back": "Anderen Code nachschlagen",
  "verify.perm.title": "Immer erreichbar — auch ohne DeCite",
  "verify.perm.body": "Dieses Zitat liegt an zwei unabhängigen öffentlichen Orten, die kein einzelnes Unternehmen kontrolliert: einem dauerhaften öffentlichen Register und einem dauerhaften öffentlichen Archiv. Jede Person kann eines davon direkt öffnen, für immer — selbst wenn die DeCite-Website je verschwindet. Hier sind beide Wege zu genau diesem Eintrag, ganz ohne uns.",
  "verify.perm.chain": "Das öffentliche Register",
  "verify.perm.callHint": "Suche deinen Code, {code}, im öffentlichen Register:",
  "verify.perm.readOn": "Öffentliches Register öffnen",
  "verify.perm.ipfs": "Das dauerhafte Archiv",
  "verify.perm.ipfsHint": "Öffne das gesicherte Gespräch über eine beliebige öffentliche Kopie des Archivs:",
  "verify.perm.note": "DeCite ist nur eine bequeme Art, all das zu lesen. Das Zitat selbst liegt auf unabhängiger öffentlicher Infrastruktur und besteht ohne uns fort.",
  "home.independent.title": "Deine Zitate hängen nicht von uns ab",
  "home.independent.body": "Jedes Zitat wird an zwei unabhängigen öffentlichen Orten gesichert, die kein einzelnes Unternehmen kontrolliert. Sollte DeCite je verschwinden, blieben deine Nachweise von selbst dauerhaft lesbar und überprüfbar — ohne Website, ohne Konto und ohne Erlaubnis.",
  "home.independent.viewRegistry": "Öffentliches Register ansehen",
  "success.error.title": "Wir konnten dein Gespräch nicht fertig versiegeln",
  "success.retry": "Zurück zum Versiegeln",
  "success.sealAnother": "Weiteres Gespräch versiegeln",
  "receipts.title": "Meine Belege",
  "receipts.subtitle": "Gib die beim Versiegeln verwendete E-Mail ein, um deine Zitatcodes zu finden.",
  "receipts.action": "Suchen",
  "receipts.empty": "Für diese E-Mail wurden noch keine Zitate gefunden.",
  "receipts.notConfigured": "Gespeicherte Belege sind auf dieser Seite noch nicht verfügbar.",
  "feedback.title": "Feedback & Vorschläge",
  "feedback.subtitle": "Sag uns, was wir verbessern sollen, melde ein Problem oder teile eine Idee. Wir lesen alles.",
  "feedback.type.label": "Welche Art von Feedback?",
  "feedback.type.suggestion": "Vorschlag",
  "feedback.type.bug": "Problem",
  "feedback.type.praise": "Lob",
  "feedback.type.other": "Sonstiges",
  "feedback.message.label": "Deine Nachricht",
  "feedback.message.placeholder": "Was beschäftigt dich? Je konkreter, desto besser.",
  "feedback.email.label": "E-Mail (optional)",
  "feedback.email.help": "Nur falls du eine Antwort möchtest. Wir verwenden sie für nichts anderes.",
  "feedback.submit": "Feedback senden",
  "feedback.sending": "Wird gesendet…",
  "feedback.error.empty": "Bitte gib eine Nachricht ein.",
  "feedback.error.generic": "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
  "feedback.thanks.title": "Danke!",
  "feedback.thanks.body": "Dein Feedback ist eingegangen. Es hilft wirklich, DeCite zu gestalten.",
  "feedback.thanks.again": "Mehr Feedback senden",
  "feedback.thanks.home": "Zurück zur Startseite",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "Häufige Fragen",
  "faq.subtitle":
    "Alles über das Versiegeln eines Gesprächs mit KI, das Zitieren und wie der Nachweis für immer lesbar bleibt. Ihre Frage nicht dabei? Senden Sie sie über Feedback — wir beantworten alles.",
  "faq.group.about": "Über DeCite",
  "faq.group.sealing": "Ein Gespräch versiegeln",
  "faq.group.citation": "Ihr Zitat",
  "faq.group.readers": "Für Leser und Gutachter",
  "faq.group.trust": "Dauerhaftigkeit und Vertrauen",
  "faq.group.privacy": "Datenschutz und Sicherheit",
  "faq.stillTitle": "Noch eine Frage?",
  "faq.stillBody":
    "Wenn hier etwas unbeantwortet blieb, fragen Sie uns direkt — wir lesen jede Nachricht und antworten meist innerhalb eines Tages.",
  "faq.stillCta": "Eine Frage stellen",
  "faq.sealCta": "Einen Dialog versiegeln",

  "faq.q.what": "Was ist DeCite?",
  "faq.a.what":
    "DeCite speichert ein Gespräch, das Sie mit einer KI geführt haben, in einem dauerhaften öffentlichen Eintrag und gibt Ihnen einen kurzen Zitatcode — etwa DC-20260619-01 —, den Sie in Ihre Arbeit, Ihr Buch oder Ihren Artikel setzen können. Wer den Code hat, kann ihn später nachschlagen und genau dieses Gespräch Wort für Wort lesen, samt Datum und Uhrzeit der Speicherung. So wird aus einem Chat, der verschwinden könnte, eine Quelle, die sich immer überprüfen lässt.",
  "faq.q.who": "Für wen ist das gedacht?",
  "faq.a.who":
    "Für alle, deren Denken im Gespräch mit einer KI Gestalt angenommen hat und die das ehrlich kenntlich machen wollen — Forschende, Studierende, Autorinnen und Autoren, Journalisten und Lehrende. Autoren erstellen damit einen dauerhaften, zitierfähigen Eintrag; Leser, Gutachter und Redakteure prüfen damit, was genau die KI gefragt wurde und was sie geantwortet hat.",
  "faq.q.free": "Ist es wirklich kostenlos? Gibt es einen Haken?",
  "faq.a.free":
    "Das Versiegeln ist während unseres Starts kostenlos — kein Konto, keine Karte, kein versteckter Schritt. Die Kosten für das Speichern und dauerhafte Registrieren jedes Gesprächs übernehmen wir für Sie. Sollte sich das je ändern, wird der Preis klar angezeigt, bevor Sie etwas versiegeln, und bereits versiegelte Gespräche bleiben für immer versiegelt.",

  "faq.q.how": "Wie versiegle ich ein Gespräch?",
  "faq.a.how":
    "Fügen Sie entweder einen öffentlichen Freigabelink zu Ihrem KI-Chat oder den Gesprächstext selbst ein, ergänzen Sie einen kurzen Titel, wo Sie es verwenden, und klicken Sie auf Versiegeln. In wenigen Sekunden speichert DeCite das Gespräch in einem dauerhaften Archiv, reserviert Ihren Zitatcode und trägt es in ein öffentliches Register ein. Das Zitat sehen Sie sofort, und wir senden es Ihnen per E-Mail, wenn Sie Ihre Adresse angeben.",
  "faq.q.linkVsPaste": "Was ist der Unterschied zwischen „Offizieller Freigabelink“ und „Text einfügen“?",
  "faq.a.linkVsPaste":
    "Nutzen Sie den Offiziellen Freigabelink, wenn Ihre KI einen öffentlichen Link bietet, den jeder öffnen kann — DeCite liest das Gespräch daraus aus und speichert eine dauerhafte Kopie. Nutzen Sie Text einfügen, wenn es keinen öffentlichen Link gibt: Sie fügen den Gesprächstext selbst ein, und DeCite speichert genau das, was Sie einfügen. Beide ergeben denselben dauerhaften, zitierfähigen Eintrag.",
  "faq.q.platforms": "Welche KI-Plattformen werden unterstützt?",
  "faq.a.platforms":
    "Öffentliche Freigabelinks funktionieren von ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen und weiteren. Für jede KI, die keinen öffentlichen Link bietet — oder für einen privaten Chat, den Sie lieber einfügen — nutzen Sie Text einfügen; das funktioniert mit jedem Werkzeug, auch mit nicht aufgeführten.",
  "faq.q.gemini": "Gemini oder DeepSeek geben mir keinen öffentlichen Link. Was tun?",
  "faq.a.gemini":
    "Manche Plattformen halten den Chat in Ihrem Browser, sodass ein Link von außen nicht lesbar ist. Öffnen Sie das Gespräch, markieren und kopieren Sie den Text, wechseln Sie dann zu Text einfügen und fügen Sie ihn ein. DeCite speichert genau das, was Sie einfügen. Sie können auch den Link zum Originalchat im optionalen Feld angeben, damit Ihr Zitat festhält, welche KI Sie verwendet haben.",
  "faq.q.account": "Brauche ich ein Konto, eine Zahlung oder eine Krypto-Wallet?",
  "faq.a.account":
    "Nein. Keine Anmeldung, keine Karte, nichts zu installieren. Sie brauchen weder eine Wallet noch technisches Wissen — DeCite übernimmt das Speichern und Registrieren im Hintergrund für Sie. Eine E-Mail ist optional und dient nur dazu, Ihnen das Zitat zu senden und es Sie später wiederfinden zu lassen.",
  "faq.q.time": "Wie lange dauert das Versiegeln?",
  "faq.a.time":
    "Meist nur ein paar Sekunden. Lassen Sie die Seite geöffnet, während es läuft — DeCite speichert das Gespräch in einem dauerhaften Archiv, reserviert Ihren Code und trägt es ins öffentliche Register ein. Sobald es fertig ist, sehen Sie Ihr Zitat sofort.",
  "faq.q.language": "Kann ich ein Gespräch in jeder Sprache versiegeln?",
  "faq.a.language":
    "Ja. DeCite speichert den Gesprächstext genau so, wie er ist, in jeder Sprache und Schrift. Die Oberfläche selbst gibt es in mehreren Sprachen — wechseln Sie jederzeit über das Sprachmenü in der oberen Leiste.",

  "faq.q.code": "Wie sieht der Zitatcode aus?",
  "faq.a.code":
    "Es ist ein kurzer, klarer Code der Form DC-JJJJMMTT-NN — zum Beispiel DC-20260619-01, also das erste am 19. Juni 2026 versiegelte Gespräch. Er lässt sich leicht in ein Literaturverzeichnis tippen und von Lesern leicht nachschlagen.",
  "faq.q.cite": "Wie zitiere ich es in meiner Arbeit oder meinem Buch?",
  "faq.a.cite":
    "Beim Versiegeln eines Gesprächs gibt Ihnen DeCite eine fertige Quellenangabe im APA-7-Stil, die Sie direkt in Ihr Literaturverzeichnis kopieren können, samt Zitatcode und Link zum öffentlichen Eintrag. Sie können sie frei an den Stil anpassen, den Ihre Zeitschrift oder Ihr Verlag verlangt.",
  "faq.q.edit": "Kann ich ein Gespräch nach dem Versiegeln bearbeiten oder aktualisieren?",
  "faq.a.edit":
    "Nein — und genau das ist der Sinn. Ein versiegeltes Gespräch kann niemand ändern, auch wir nicht, und gerade das macht es als Zitat vertrauenswürdig. Ging das Gespräch weiter oder möchten Sie eine neuere Fassung festhalten, versiegeln Sie es einfach erneut für ein eigenes Zitat.",
  "faq.q.lost": "Ich habe meinen Zitatcode verloren. Wie finde ich ihn wieder?",
  "faq.a.lost":
    "Haben Sie beim Versiegeln Ihre E-Mail angegeben, gehen Sie zu Meine Belege und geben dieselbe E-Mail ein, um alle damit verknüpften Zitatcodes zu sehen. Ohne angegebene E-Mail brauchen Sie den Code selbst, um das Gespräch nachzuschlagen — bewahren Sie ihn also sicher auf.",

  "faq.q.lookup": "Wie schlägt jemand mein Zitat nach?",
  "faq.a.lookup":
    "Er geht auf die Seite Suchen, gibt den Zitatcode ein, und genau das versiegelte Gespräch öffnet sich — der vollständige Text, Datum und Uhrzeit der Versiegelung und welche KI verwendet wurde. Zum Lesen sind weder Konto noch Zahlung nötig.",
  "faq.q.readerAccount": "Brauchen Leser oder Gutachter ein Konto zum Überprüfen?",
  "faq.a.readerAccount":
    "Nein. Jeder mit dem Code kann das Gespräch kostenlos und ohne Anmeldung lesen. Da der Eintrag auch auf unabhängiger öffentlicher Infrastruktur liegt, kann ein gründlicher Gutachter ihn sogar ganz ohne die DeCite-Website überprüfen.",

  "faq.q.where": "Wo wird das Gespräch eigentlich gespeichert?",
  "faq.a.where":
    "An zwei unabhängigen öffentlichen Orten, die kein einzelnes Unternehmen kontrolliert: einem dauerhaften öffentlichen Archiv mit dem vollständigen Gespräch und einem öffentlichen Register, das seinen Zitatcode und den Zeitpunkt der Versiegelung festhält. DeCite ist nur ein bequemes Fenster zu beiden — der Eintrag braucht uns nicht, um zu bestehen.",
  "faq.q.ifGone": "Was passiert, wenn DeCite einmal verschwindet?",
  "faq.a.ifGone":
    "Ihre Zitate funktionieren weiter. Da jedes auf unabhängiger öffentlicher Infrastruktur liegt, kann jeder weiterhin das öffentliche Register und das dauerhafte Archiv direkt öffnen — ohne Website, ohne Konto und ohne Erlaubnis. Der Nachweis überdauert das Unternehmen.",
  "faq.q.timestamp": "Woher weiß ich, dass Datum und Uhrzeit verlässlich sind?",
  "faq.a.timestamp":
    "Beim Versiegeln eines Gesprächs werden Datum und Uhrzeit exakt in ein öffentliches Register geschrieben, das sich danach nicht heimlich ändern lässt. Die Zeit ist also nicht nur unser Wort — jeder kann sie unabhängig prüfen, und das macht sie nachprüfungssicher.",

  "faq.q.public": "Ist das versiegelte Gespräch öffentlich? Wer kann es sehen?",
  "faq.a.public":
    "Ja. Ein versiegeltes Gespräch ist zum Zitieren gedacht, daher kann jeder mit dem Zitatcode es lesen, und es bleibt dauerhaft öffentlich. Versiegeln Sie nur Gespräche, die Sie bedenkenlos für immer öffentlich machen.",
  "faq.q.sensitive": "Was ist mit persönlichen oder vertraulichen Angaben im Chat?",
  "faq.a.sensitive":
    "Da das Versiegeln dauerhaft und öffentlich ist, entfernen Sie vor dem Versiegeln alles Private oder Sensible — Namen, Kontaktdaten, unveröffentlichte Daten, alles Vertrauliche. Ein versiegeltes Gespräch lässt sich weder bearbeiten noch zurückziehen, prüfen Sie den Text also vorher sorgfältig.",
  "faq.q.email": "Speichern Sie meine E-Mail, und wofür?",
  "faq.a.email":
    "Die E-Mail ist optional. Geben Sie eine an, nutzen wir sie nur, um Ihnen Ihr Zitat zu senden und Sie Ihre Codes unter Meine Belege wiederfinden zu lassen. Sie ist nicht Teil des öffentlichen Eintrags, und für nichts anderes verwenden wir sie.",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "Neueste",
  "nav.more": "Mehr",
  "mint.share.label": "In die öffentliche Liste „Neueste Zitate“ aufnehmen",
  "mint.share.help":
    "Standardmäßig aktiviert. Wer den Code hat, kann ein versiegeltes Zitat ohnehin lesen; dies listet es nur öffentlich auf, damit andere es entdecken. Schalten Sie es aus, um es aus der Liste herauszuhalten.",
  "latest.title": "Neueste Zitate",
  "latest.subtitle":
    "Kürzlich versiegelte Gespräche, die ihre Autoren öffentlich teilen wollten. Öffnen Sie eines, um den genauen Dialog dahinter zu lesen.",
  "latest.loading": "Neueste Zitate werden geladen…",
  "latest.empty": "Noch keine öffentlichen Zitate — versiegeln Sie eines, dann kann es hier erscheinen.",
  "latest.notConfigured": "Die öffentliche Liste ist auf dieser Seite noch nicht verfügbar.",
  "latest.error": "Die Liste konnte gerade nicht geladen werden. Bitte erneut versuchen.",
  "latest.anon": "Anonym",
  "latest.viewAll": "Alle ansehen",
  "latest.sealCta": "Einen Dialog versiegeln",

  "footer.note": "Dauerhaft · Mit Zeitstempel · Unabhängig überprüfbar",
  "common.user": "Nutzer",
  "common.assistant": "Assistent",
};

// ─── 日本語 (Japanese) ──────────────────────────────────────────────────────
const ja: Dict = {
  "brand.tagline": "AI との対話に、永続的で検証できる引用を",
  "nav.home": "理念",
  "nav.mint": "対話を封印",
  "nav.verify": "照会",
  "nav.receipts": "受領記録",
  "nav.feedback": "フィードバック",
  "nav.faq": "よくある質問",
  "nav.language": "言語",
  "cta.mint.title": "著者の方へ",
  "cta.mint.desc": "AI と交わした対話を永久に保存し、著作に使える引用を受け取りましょう。",
  "cta.mint.action": "引用を作成",
  "cta.verify.title": "読者・査読者の方へ",
  "cta.verify.desc": "引用コードを入力すると、それが指す対話そのものを読めます。",
  "cta.verify.action": "引用を照会",
  "home.eyebrow": "AI 時代の、誠実な帰属表示",
  "home.hero.title": "AI とともに考え抜いた。さあ、それを引用しよう。",
  "home.hero.lede":
    "研究はますます AI との対話の中で形になります——しかしその対話は静かに消え、書き換えられ、あるいは後から証明できなくなります。DeCite は対話を永久に保存し、論文や書籍に載せられる短い引用コードを渡します。その後は誰でも照会して、何がいつ語られたかを正確に読めます。アカウントも支払いも不要、技術的に学ぶことは何もありません。",
  "home.crisis.title": "対話が消えると、証拠も消える",
  "home.crisis.body":
    "共有したチャットのリンクは切れることがあり、プラットフォームはいつでも対話を書き換えたり削除したりできます。そうなると査読者は、何が問われ、AI が何を答え、いつのことかを確かめられなくなり、あなたの帰属表示は言ったもの勝ちになります。DeCite は対話を永続化し、元のプラットフォームがとうに無くなっても、いつでもそのまま読み返せるようにします。",
  "home.pillars.permanence.title": "永続",
  "home.pillars.permanence.body": "いったん保存された対話は、書き換えも、こっそり取り下げることもできません——私たちにも、誰にも。",
  "home.pillars.timestamp.title": "日時の記録",
  "home.pillars.timestamp.body": "各引用は保存した正確な日時を記録するので、時点を争う余地がありません。",
  "home.pillars.citation.title": "引用が簡単",
  "home.pillars.citation.body": "DC-20260619-01 のような短く明快なコードが得られ、論文や書籍にそのまま入れられます。",
  "home.quote": "引用とは、出典を見つけられるという約束です。私たちはただ、その約束を守ります。",
  "mint.title": "対話を封印",
  "mint.subtitle": "対話を永久に保存し、引用できる引用を受け取ります。",
  "mint.noWallet": "技術的なことは不要です。DeCite があなたに代わって対話を保存し、永久に登録します——貼り付けて「封印」を押すだけ。",
  "mint.freeLaunch": "ローンチ期間は無料——アカウントもカードも不要。DeCite があなたの対話を永久に保存し登録します。メールを追加すれば、引用をお送りします。",
  "mint.tab.link": "公式共有リンク",
  "mint.tab.paste": "テキストを貼り付け",
  "mint.link.label": "AI の共有リンク",
  "mint.link.help": "ChatGPT、Claude、Grok、Copilot、Perplexity、Poe、Mistral、Meta AI、Qwen などの公式な公開共有リンク。一部のプラットフォーム（例：Gemini、DeepSeek）は対話を外部の読者から隠すため、それらには「テキストを貼り付け」をお使いください。",
  "mint.paste.label": "対話のテキスト",
  "mint.paste.placeholder": "対話をここに貼り付けてください。可能なら各発言を 'User:' と 'Assistant:' で始めてください。",
  "mint.paste.help": "AI が公開リンクを提供しない場合に使用します——貼り付けた内容がそのまま保存されます。",
  "mint.originUrl.label": "元の AI 対話へのリンク（任意）",
  "mint.originUrl.help": "元のチャットのリンクを貼り付けてください（任意の AI）。どの AI を使ったかを記録し、読者が出典を開けるようにします——保存されるのは上のテキストです。",
  "mint.originUrl.detected": "検出された AI：{provider} — 引用とともに記録されます。",
  "mint.sourceRef.label": "どこで使うか（著作のタイトル）",
  "mint.sourceRef.placeholder": "例：合成的推論の倫理について（2026）第3章",
  "mint.author.label": "引用に載せるお名前（任意）",
  "mint.email.label": "メール（任意）",
  "mint.email.help": "このメールに引用をお送りし、「受領記録」に保存して後で見つけられるようにします。",
  "mint.step.pin": "対話を永久アーカイブに保存中",
  "mint.step.code": "引用コードを予約中",
  "mint.step.notarize": "公開レジストリに登録中",
  "mint.step.wait": "数秒かかります——このページを開いたままにしてください。",
  "mint.action.seal": "封印して引用を作成",
  "mint.action.sealing": "封印中…",
  "mint.action.sealFree": "無料で封印",
  "mint.action.pay": "${price} を支払って封印",
  "mint.action.preparing": "安全な決済を準備中…",
  "mint.pay.note": "一回限りの ${price} の料金で、対話の保存と永久登録をまかないます。決済は Stripe が安全に処理し、カード情報を当社が見ることも保存することもありません。",
  "mint.canceled": "決済がキャンセルされました。対話は保存されていません。",
  "mint.success.title": "保存・登録完了",
  "mint.success.desc": "対話は永久になりました。参考文献用に下の引用をコピーしてください。",
  "mint.success.code": "引用コード",
  "mint.success.tx": "公開記録",
  "mint.success.apa": "引用（APA 形式）",
  "mint.success.custodian": "DeCite があなたに代わって永久に登録しました",
  "mint.copy": "コピー",
  "mint.copied": "コピーしました",
  "mint.viewVerify": "引用ページを開く",
  "mint.error.badLink": "有効な公開 AI 共有リンクを入力してください（ChatGPT、Claude、Grok、Perplexity など）。",
  "mint.pasteOnlyHint": "{provider} は対話をブラウザ内に保持するため、リンクから読み取れません。{provider} のチャットを開き、すべて選択してコピーし、ここに貼り付けてください——貼り付けた内容を DeCite はそのまま保存します。",
  "mint.switchToPaste": "「テキストを貼り付け」を使う",
  "mint.error.empty": "対話を追加してください。",
  "mint.error.sourceRef": "どこで使うかを入力してください。",
  "mint.warn.noContract": "このサイトはまだ封印の準備ができていません。",
  "verify.title": "引用を照会",
  "verify.subtitle": "引用コードを入力すると、その背後にある対話そのものを読めます。",
  "verify.input.placeholder": "引用コードを入力（例：DC-20260619-01）",
  "verify.action": "照会",
  "verify.error.format": "有効な引用コードではないようです（DC-YYYYMMDD-NN）。",
  "verify.error.notFound": "このコードの引用は見つかりませんでした。",
  "verify.error.config": "このサイトでは照会がまだ設定されていません。",
  "verify.loading": "引用を照会中…",
  "verify.sealed": "封印・検証済み",
  "verify.meta.title": "引用の詳細",
  "verify.meta.timestamp": "封印した日時",
  "verify.meta.ai": "AI / モデル",
  "verify.cite.title": "そのまま引用可能",
  "verify.cite.help": "この参照を論文や書籍の参考文献にそのままコピーしてください（APA 第7版形式）。",
  "verify.meta.authorName": "著者",
  "verify.meta.custodian": "封印者",
  "verify.meta.registry": "公開レジストリ",
  "verify.meta.origin": "追加方法",
  "verify.meta.cid": "アーカイブ ID",
  "verify.meta.code": "引用コード",
  "verify.origin.link": "元の AI 対話",
  "verify.origin.open": "オリジナルを開く（外部サイト）",
  "verify.origin.warn": "外部リンク——元のプラットフォームがこの対話を変更・削除している可能性があります。",
  "verify.ipfs.title": "永久アーカイブ",
  "verify.ipfs.desc": "永久公開アーカイブから直接読み取り——元の対話が削除されても利用できます。",
  "verify.ipfs.open": "保存されたファイルを開く",
  "verify.role.user": "ユーザー",
  "verify.role.assistant": "アシスタント",
  "verify.back": "別のコードを照会",
  "verify.perm.title": "いつでも到達可能——DeCite がなくても",
  "verify.perm.body": "この引用は、どの一社にも支配されない2つの独立した公開された場所に保管されています。永久公開レジストリと永久公開アーカイブです。どちらも誰でも直接、永久に開けます——たとえ DeCite のウェブサイトがいつか無くなっても。以下は、私たちなしでこの同じ記録に到達する2つの方法です。",
  "verify.perm.chain": "公開レジストリ",
  "verify.perm.callHint": "公開レジストリであなたのコード {code} を検索します：",
  "verify.perm.readOn": "公開レジストリを開く",
  "verify.perm.ipfs": "永久アーカイブ",
  "verify.perm.ipfsHint": "アーカイブの任意の公開コピーから、保存された対話を開きます：",
  "verify.perm.note": "DeCite はこれらを読むための便利な手段にすぎません。引用そのものは独立した公開インフラ上にあり、私たちがなくても存続します。",
  "home.independent.title": "あなたの引用は私たちに依存しません",
  "home.independent.body": "どの引用も、どの一社にも支配されない2つの独立した公開された場所に保存されます。万一 DeCite が無くなっても、あなたの参照はそれ自体で永久に読め、検証できます——ウェブサイトもアカウントも許可も不要です。",
  "home.independent.viewRegistry": "公開レジストリを見る",
  "success.error.title": "対話の封印を完了できませんでした",
  "success.retry": "封印に戻る",
  "success.sealAnother": "別の対話を封印",
  "receipts.title": "受領記録",
  "receipts.subtitle": "封印時に使用したメールを入力して、引用コードを探します。",
  "receipts.action": "検索",
  "receipts.empty": "このメールの引用はまだ見つかりません。",
  "receipts.notConfigured": "このサイトでは保存された受領記録はまだ利用できません。",
  "feedback.title": "フィードバックと提案",
  "feedback.subtitle": "改善点を教えてください。問題の報告やアイデアの共有も歓迎です。すべて拝読します。",
  "feedback.type.label": "どの種類のフィードバックですか？",
  "feedback.type.suggestion": "提案",
  "feedback.type.bug": "問題",
  "feedback.type.praise": "称賛",
  "feedback.type.other": "その他",
  "feedback.message.label": "メッセージ",
  "feedback.message.placeholder": "何をお考えですか？ 具体的なほど助かります。",
  "feedback.email.label": "メール（任意）",
  "feedback.email.help": "返信が必要な場合のみ。他の用途には使用しません。",
  "feedback.submit": "フィードバックを送信",
  "feedback.sending": "送信中…",
  "feedback.error.empty": "メッセージを入力してください。",
  "feedback.error.generic": "問題が発生しました。もう一度お試しください。",
  "feedback.thanks.title": "ありがとうございます！",
  "feedback.thanks.body": "フィードバックを受け取りました。DeCite を形づくる本当の助けになります。",
  "feedback.thanks.again": "さらに送信",
  "feedback.thanks.home": "ホームに戻る",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "よくある質問",
  "faq.subtitle":
    "AI との会話を封印し、それを引用し、証拠が永久に読める状態を保つ方法のすべて。質問が見つかりませんか？「フィードバック」からお送りください——すべてにお答えします。",
  "faq.group.about": "DeCite について",
  "faq.group.sealing": "会話を封印する",
  "faq.group.citation": "あなたの引用",
  "faq.group.readers": "読者・査読者の方へ",
  "faq.group.trust": "永続性と信頼性",
  "faq.group.privacy": "プライバシーと安全",
  "faq.stillTitle": "まだ質問がありますか？",
  "faq.stillBody":
    "ここで解決しなかった場合は、直接お尋ねください——すべてのメッセージを読み、通常は1日以内に返信します。",
  "faq.stillCta": "質問する",
  "faq.sealCta": "対話を封印する",

  "faq.q.what": "DeCite とは何ですか？",
  "faq.a.what":
    "DeCite は、あなたが AI と交わした会話を永久的な公開記録に保存し、DC-20260619-01 のような短い引用コードを発行します。これを論文や書籍、記事に記載できます。コードを持つ人は誰でも後でそれを照会し、保存された日時とともに、その会話を一字一句そのまま読むことができます。消えてしまうかもしれない会話を、いつでも確認できる出典に変えるのです。",
  "faq.q.who": "誰のためのものですか？",
  "faq.a.who":
    "AI との会話の中で考えがかたちになり、それを誠実に出典表示したいすべての人のためです——研究者、学生、著者、ジャーナリスト、教育者など。著者は引用可能で永久的な記録を作るために使い、読者・査読者・編集者は AI に何を尋ね、AI が何を答えたかを正確に検証するために使います。",
  "faq.q.free": "本当に無料ですか？裏はありますか？",
  "faq.a.free":
    "ローンチ期間中、封印は無料です——アカウントもカードも不要で、隠れた手順もありません。各会話を保存し永久に登録する費用は当社が負担します。万一それが変わる場合は、何かを封印する前に料金を明確に表示し、すでに封印された会話は永久に封印されたままです。",

  "faq.q.how": "会話はどうやって封印しますか？",
  "faq.a.how":
    "AI チャットの公開共有リンク、または会話のテキストそのものを貼り付け、どこで使うかを示す短いタイトルを加えて「封印」をクリックします。数秒で DeCite が会話を永久アーカイブに保存し、引用コードを確保し、公開レジストリに記録します。引用はすぐに表示され、メールアドレスを入力すればメールでもお送りします。",
  "faq.q.linkVsPaste": "「公式共有リンク」と「テキストを貼り付け」の違いは何ですか？",
  "faq.a.linkVsPaste":
    "誰でも開ける公開リンクを AI が提供する場合は「公式共有リンク」を使います——DeCite がそこから会話を読み取り、永久的なコピーを保存します。公開リンクがない場合は「テキストを貼り付け」を使います。会話のテキストを自分で貼り付け、DeCite が貼り付けた内容をそのまま保存します。どちらも同じ永久的で引用可能な記録になります。",
  "faq.q.platforms": "どの AI プラットフォームに対応していますか？",
  "faq.a.platforms":
    "公開共有リンクは ChatGPT、Claude、Grok、Copilot、Perplexity、Poe、Mistral、Meta AI、Qwen などで使えます。公開リンクを提供しない AI——または貼り付けたい非公開チャット——には「テキストを貼り付け」を使ってください。これは一覧にないものを含め、あらゆるツールで使えます。",
  "faq.q.gemini": "Gemini や DeepSeek は公開リンクをくれません。どうすればよいですか？",
  "faq.a.gemini":
    "一部のプラットフォームは会話をブラウザ内に保持するため、リンクでは外部の読者が読めません。会話を開き、テキストを選択してコピーし、「テキストを貼り付け」に切り替えて貼り付けてください。DeCite は貼り付けた内容をそのまま保存します。任意の欄に元のチャットのリンクを追加すれば、どの AI を使ったかも引用に記録できます。",
  "faq.q.account": "アカウントや支払い、暗号資産ウォレットは必要ですか？",
  "faq.a.account":
    "いいえ。登録もカードも不要で、インストールするものもありません。ウォレットも技術的な知識も不要で——DeCite が裏側で保存と登録を代行します。メールは任意で、引用をお送りし、後で再び見つけられるようにするためだけに使います。",
  "faq.q.time": "封印にはどれくらいかかりますか？",
  "faq.a.time":
    "通常はほんの数秒です。処理中はページを開いたままにしてください——DeCite が会話を永久アーカイブに保存し、コードを確保し、公開レジストリに記録しています。完了すると、引用がすぐに表示されます。",
  "faq.q.language": "どの言語の会話でも封印できますか？",
  "faq.a.language":
    "はい。DeCite はあらゆる言語・文字の会話テキストをそのまま保存します。インターフェース自体も複数の言語に対応しており——上部バーの言語メニューからいつでも切り替えられます。",

  "faq.q.code": "引用コードはどのようなものですか？",
  "faq.a.code":
    "DC-YYYYMMDD-NN という形式の短く分かりやすいコードです——例えば DC-20260619-01 は、2026年6月19日に封印された最初の会話を表します。参考文献に入力しやすく、読者が照会するのも簡単です。",
  "faq.q.cite": "論文や書籍ではどう引用すればよいですか？",
  "faq.a.cite":
    "会話を封印すると、DeCite が APA 7 形式のすぐ使える書誌情報を引用コードと公開記録リンクとともに提供します。これを参考文献にそのままコピーできます。投稿先の雑誌や出版社が求める形式に自由に合わせることもできます。",
  "faq.q.edit": "封印した後で会話を編集・更新できますか？",
  "faq.a.edit":
    "いいえ——そしてそれこそが要点です。封印された会話は当社を含め誰も変更できず、まさにそれが引用として信頼できる理由です。会話が続いた場合や新しい版を残したい場合は、もう一度封印して別の引用を取得してください。",
  "faq.q.lost": "引用コードをなくしました。もう一度見つけるには？",
  "faq.a.lost":
    "封印時にメールを追加していれば、「受領記録」に進み、同じメールを入力すると、それに紐づくすべての引用コードを確認できます。メールを追加していない場合、会話を照会するにはコードそのものが必要です——大切に保管してください。",

  "faq.q.lookup": "他の人はどうやって私の引用を照会しますか？",
  "faq.a.lookup":
    "「照会」ページで引用コードを入力すると、まさにその封印された会話が開きます——全文、封印された日時、使用された AI が表示されます。読むのにアカウントも支払いも不要です。",
  "faq.q.readerAccount": "読者や査読者が検証するのにアカウントは必要ですか？",
  "faq.a.readerAccount":
    "いいえ。コードがあれば誰でも無料で、登録なしに会話を読めます。記録は単一の企業に支配されない独立した公共インフラ上にもあるため、熱心な査読者は DeCite のサイトをまったく使わずに検証することさえできます。",

  "faq.q.where": "会話は実際どこに保存されますか？",
  "faq.a.where":
    "いかなる単一の企業も支配しない、2つの独立した公共の場所です。会話全体を保持する永久的な公開アーカイブと、その引用コードと封印の瞬間を記録する公開レジストリです。DeCite はその両方への便利な窓口にすぎず——記録の存在は当社に依存しません。",
  "faq.q.ifGone": "DeCite がいつか消えたらどうなりますか？",
  "faq.a.ifGone":
    "あなたの引用は機能し続けます。各引用は独立した公共インフラ上に保存されているため、誰でも公開レジストリと永久アーカイブを直接開けます——ウェブサイトもアカウントも許可も不要です。証拠は企業よりも長く残ります。",
  "faq.q.timestamp": "日時が信頼できると、どうして分かりますか？",
  "faq.a.timestamp":
    "会話が封印されると、正確な日時が、後からひそかに改ざんできない公開レジストリに書き込まれます。ですから日時は当社の言い分にとどまらず——誰でも独立して確認でき、それが厳しい検証に耐える理由です。",

  "faq.q.public": "封印された会話は公開されますか？誰が見られますか？",
  "faq.a.public":
    "はい。封印された会話は引用可能であることを目的としているため、引用コードを持つ人は誰でも読むことができ、永久に公開されたままです。永久に公開して差し支えない会話だけを封印してください。",
  "faq.q.sensitive": "チャット内の個人情報や機密情報はどうなりますか？",
  "faq.a.sensitive":
    "封印は永久的かつ公開であるため、封印する前に私的・機微な情報——氏名、連絡先、未公開のデータ、あらゆる機密——を取り除いてください。いったん封印された会話は編集も取り下げもできませんので、まずテキストを慎重に確認してください。",
  "faq.q.email": "私のメールアドレスを保存しますか？何のためですか？",
  "faq.a.email":
    "メールは任意です。ご提供いただいた場合、引用をお送りし、「受領記録」でコードを再び見つけられるようにするためだけに使います。これは公開記録には含まれず、それ以外の用途には一切使いません。",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "最新",
  "nav.more": "その他",
  "mint.share.label": "公開の「最新の引用」一覧に掲載する",
  "mint.share.help":
    "既定でオンです。コードを持つ人は封印された引用をもともと読めます。これは他の人が見つけられるよう公開一覧に載せるだけです。一覧に載せたくない場合はオフにしてください。",
  "latest.title": "最新の引用",
  "latest.subtitle":
    "著者が公開を選んだ、最近封印された会話です。いずれかを開くと、その背後にある実際の対話を読めます。",
  "latest.loading": "最新の引用を読み込んでいます…",
  "latest.empty": "公開された引用はまだありません——封印すればここに表示されることがあります。",
  "latest.notConfigured": "このサイトでは公開一覧はまだ利用できません。",
  "latest.error": "ただ今一覧を読み込めませんでした。もう一度お試しください。",
  "latest.anon": "匿名",
  "latest.viewAll": "すべて見る",
  "latest.sealCta": "対話を封印する",

  "footer.note": "永続 · 日時記録 · 独立して検証可能",
  "common.user": "ユーザー",
  "common.assistant": "アシスタント",
};

// ─── Türkçe ──────────────────────────────────────────────────────────────────
const tr: Dict = {
  "brand.tagline": "AI ile yaptığınız konuşmalar için kalıcı, doğrulanabilir atıflar",
  "nav.home": "Manifesto",
  "nav.mint": "Diyalog Mühürle",
  "nav.verify": "Sorgula",
  "nav.receipts": "Makbuzlarım",
  "nav.feedback": "Geri Bildirim",
  "nav.faq": "Sıkça Sorulan Sorular",
  "nav.language": "Dil",
  "cta.mint.title": "Yazarlar için",
  "cta.mint.desc": "AI ile yaptığınız bir konuşmayı kalıcı olarak saklayın ve eserinizde kullanabileceğiniz bir atıf alın.",
  "cta.mint.action": "Atıf oluştur",
  "cta.verify.title": "Okuyucular ve hakemler için",
  "cta.verify.desc": "Herhangi bir atıf kodunu girin ve işaret ettiği konuşmanın tam halini okuyun.",
  "cta.verify.action": "Atıf sorgula",
  "home.eyebrow": "AI çağı için dürüst kaynak gösterimi",
  "home.hero.title": "AI düşünceni şekillendirmene yardım etti. Şimdi ona atıf yap.",
  "home.hero.lede":
    "Giderek daha çok araştırma AI ile konuşarak biçimleniyor — ama bu konuşmalar sessizce kayboluyor, değiştiriliyor ya da sonradan kanıtlanamıyor. DeCite bir konuşmayı kalıcı olarak saklar ve makalenize veya kitabınıza koyabileceğiniz kısa bir atıf kodu verir. Sonrasında herkes bunu sorgulayıp tam olarak ne söylendiğini ve ne zaman söylendiğini okuyabilir. Hesap yok, ödeme yok ve öğrenilecek teknik hiçbir şey yok.",
  "home.crisis.title": "Konuşma kaybolunca kanıt da kaybolur",
  "home.crisis.body":
    "Paylaşılan bir sohbet bağlantısı çalışmayı bırakabilir ve bir platform konuşmayı istediği an değiştirebilir veya silebilir. Böyle olunca bir hakem, neyin sorulduğunu, AI'ın ne yanıt verdiğini ya da ne zaman olduğunu artık doğrulayamaz — atfınız yalnızca sizin sözünüze kalır. DeCite konuşmayı kalıcı kılar; böylece köken platform çoktan kaybolsa bile her zaman tam olduğu gibi okunabilir.",
  "home.pillars.permanence.title": "Kalıcı",
  "home.pillars.permanence.body": "Bir kez saklandıktan sonra konuşma değiştirilemez veya sessizce kaldırılamaz — ne bizim ne de başkasının elinde.",
  "home.pillars.timestamp.title": "Zaman damgalı",
  "home.pillars.timestamp.body": "Her atıf, saklandığı tam tarih ve saati kaydeder; böylece zaman asla tartışılamaz.",
  "home.pillars.citation.title": "Atıf yapması kolay",
  "home.pillars.citation.body": "DC-20260619-01 gibi kısa, temiz bir kod alırsınız; doğrudan bir makale veya kitaba koyabilirsiniz.",
  "home.quote": "Atıf, kaynağın bulunabileceğine dair bir sözdür. Biz yalnızca sözü tutuyoruz.",
  "mint.title": "Diyalog Mühürle",
  "mint.subtitle": "Konuşmayı kalıcı olarak saklayın ve alıntılayabileceğiniz bir atıf alın.",
  "mint.noWallet": "Teknik hiçbir şey gerekmez. DeCite konuşmayı sizin adınıza saklar ve kalıcı olarak kaydeder — yapıştırıp Mühürle'ye tıklayın.",
  "mint.freeLaunch": "Lansman boyunca ücretsiz — hesap yok, kart yok. DeCite konuşmanızı kalıcı olarak saklar ve kaydeder. E-postanızı ekleyin, atfı size gönderelim.",
  "mint.tab.link": "Resmî Paylaşım Linki",
  "mint.tab.paste": "Doğrudan Metni Yapıştır",
  "mint.link.label": "AI paylaşım bağlantısı",
  "mint.link.help": "ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen ve daha fazlasından resmî herkese açık paylaşım bağlantısı. Bazı platformlar (örn. Gemini, DeepSeek) konuşmayı dış okuyuculardan gizler — onlar için Doğrudan Metni Yapıştır'ı kullanın.",
  "mint.paste.label": "Konuşma metni",
  "mint.paste.placeholder": "Konuşmayı buraya yapıştırın. Mümkünse her sırayı 'User:' ve 'Assistant:' ile başlatın.",
  "mint.paste.help": "AI herkese açık bir bağlantı sunmuyorsa bunu kullanın — yapıştırdığınız tam olarak saklanır.",
  "mint.originUrl.label": "Orijinal AI konuşmasının bağlantısı (isteğe bağlı)",
  "mint.originUrl.help": "Orijinal sohbetin bağlantısını yapıştırın (herhangi bir AI). Hangi AI'ı kullandığınızı kaydeder ve okuyucuların kaynağı açmasına izin verir — saklanan ise yukarıdaki metindir.",
  "mint.originUrl.detected": "Algılanan AI: {provider} — atfınızla birlikte kaydedilecek.",
  "mint.sourceRef.label": "Nerede kullanacağınız (eser başlığı)",
  "mint.sourceRef.placeholder": "örn. Sentetik Akıl Yürütmenin Etiği (2026), Böl. 3",
  "mint.author.label": "Atıf için adınız (isteğe bağlı)",
  "mint.email.label": "E-posta (isteğe bağlı)",
  "mint.email.help": "Atfı bu e-postaya göndeririz ve Makbuzlarım altında saklarız; böylece sonra bulabilirsiniz.",
  "mint.step.pin": "Konuşma kalıcı bir arşive kaydediliyor",
  "mint.step.code": "Atıf kodunuz ayrılıyor",
  "mint.step.notarize": "Herkese açık kayda işleniyor",
  "mint.step.wait": "Bu birkaç saniye sürer — lütfen bu sayfayı açık tutun.",
  "mint.action.seal": "Mühürle ve atıf oluştur",
  "mint.action.sealing": "Mühürleniyor…",
  "mint.action.sealFree": "Ücretsiz Mühürle",
  "mint.action.pay": "${price} Öde ve Mühürle",
  "mint.action.preparing": "Güvenli ödeme hazırlanıyor…",
  "mint.pay.note": "Tek seferlik ${price} ücret, konuşmanızın saklanmasını ve kalıcı olarak kaydedilmesini karşılar. Ödeme Stripe tarafından güvenle işlenir — kart bilgilerinizi asla görmez veya saklamayız.",
  "mint.canceled": "Ödeme iptal edildi. Konuşmanız saklanmadı.",
  "mint.success.title": "Saklandı ve kaydedildi",
  "mint.success.desc": "Konuşmanız artık kalıcı. Kaynakçanız için aşağıdaki atfı kopyalayın.",
  "mint.success.code": "Atıf kodu",
  "mint.success.tx": "Herkese açık kayıt",
  "mint.success.apa": "Atıf (APA biçimi)",
  "mint.success.custodian": "DeCite tarafından sizin adınıza kalıcı olarak kaydedildi",
  "mint.copy": "Kopyala",
  "mint.copied": "Kopyalandı",
  "mint.viewVerify": "Atıf sayfasını aç",
  "mint.error.badLink": "Geçerli bir herkese açık AI paylaşım bağlantısı girin (ChatGPT, Claude, Grok, Perplexity ve daha fazlası).",
  "mint.pasteOnlyHint": "{provider} konuşmayı tarayıcınızın içinde tutar; bu yüzden bir bağlantıdan okunamaz. {provider} sohbetinizi açın, tümünü seçip kopyalayın, sonra buraya yapıştırın — yapıştırdığınızı DeCite tam olarak saklar.",
  "mint.switchToPaste": "Doğrudan Metni Yapıştır'ı kullan",
  "mint.error.empty": "Lütfen konuşmayı ekleyin.",
  "mint.error.sourceRef": "Lütfen nerede kullanacağınızı belirtin.",
  "mint.warn.noContract": "Bu site mühürleme için henüz hazır değil.",
  "verify.title": "Atıf sorgula",
  "verify.subtitle": "Bir atıf kodu girin ve arkasındaki konuşmanın tam halini okuyun.",
  "verify.input.placeholder": "Atıf kodu girin, örn. DC-20260619-01",
  "verify.action": "Sorgula",
  "verify.error.format": "Bu geçerli bir atıf kodu gibi görünmüyor (DC-YYYYMMDD-NN).",
  "verify.error.notFound": "Bu kod için bir atıf bulunamadı.",
  "verify.error.config": "Bu sitede sorgulama henüz ayarlanmadı.",
  "verify.loading": "Atıf sorgulanıyor…",
  "verify.sealed": "MÜHÜRLÜ & DOĞRULANMIŞTIR",
  "verify.meta.title": "Atıf ayrıntıları",
  "verify.meta.timestamp": "Mühürlenme tarihi",
  "verify.meta.ai": "AI / Model",
  "verify.cite.title": "Atıfa hazır",
  "verify.cite.help": "Bu künyeyi doğrudan makale veya kitap kaynakçanıza kopyalayın (APA 7 biçimi).",
  "verify.meta.authorName": "Yazar",
  "verify.meta.custodian": "Mühürleyen",
  "verify.meta.registry": "Herkese açık kayıt",
  "verify.meta.origin": "Nasıl eklendi",
  "verify.meta.cid": "Arşiv kimliği",
  "verify.meta.code": "Atıf kodu",
  "verify.origin.link": "Orijinal AI konuşması",
  "verify.origin.open": "Orijinali aç (harici site)",
  "verify.origin.warn": "Harici bağlantı — köken platform bu konuşmayı değiştirmiş veya kaldırmış olabilir.",
  "verify.ipfs.title": "Kalıcı arşiv",
  "verify.ipfs.desc": "Doğrudan kalıcı herkese açık arşivden okuyun — orijinal konuşma silinse bile erişilebilir.",
  "verify.ipfs.open": "Saklanan dosyayı aç",
  "verify.role.user": "Kullanıcı",
  "verify.role.assistant": "Asistan",
  "verify.back": "Başka bir kod sorgula",
  "verify.perm.title": "Her zaman erişilebilir — DeCite olmadan bile",
  "verify.perm.body": "Bu atıf, tek bir şirketin denetlemediği iki bağımsız herkese açık yerde tutulur: kalıcı bir herkese açık kayıt ve kalıcı bir herkese açık arşiv. Herkes bunlardan birini doğrudan ve sonsuza dek açabilir — DeCite web sitesi bir gün ortadan kalksa bile. Aşağıda, bizsiz de bu aynı kayda ulaşmanın iki yolu var.",
  "verify.perm.chain": "Herkese açık kayıt",
  "verify.perm.callHint": "Kodunuzu, {code}, herkese açık kayıtta arayın:",
  "verify.perm.readOn": "Herkese açık kaydı aç",
  "verify.perm.ipfs": "Kalıcı arşiv",
  "verify.perm.ipfsHint": "Saklanan konuşmayı arşivin herhangi bir herkese açık kopyasından açın:",
  "verify.perm.note": "DeCite yalnızca tüm bunları okumanın kullanışlı bir yoludur. Atıfın kendisi bağımsız, herkese açık altyapıda yaşar ve bizsiz de varlığını sürdürür.",
  "home.independent.title": "Atıflarınız bize bağlı değildir",
  "home.independent.body": "Her atıf, tek bir şirketin denetlemediği iki bağımsız herkese açık yerde saklanır. DeCite bir gün ortadan kalksa bile atıflarınız kendi başına sonsuza dek okunabilir ve doğrulanabilir kalır — web sitesi, hesap veya izin gerekmez.",
  "home.independent.viewRegistry": "Herkese açık kaydı görüntüle",
  "success.error.title": "Konuşmanızın mühürlenmesini tamamlayamadık",
  "success.retry": "Mühürlemeye dön",
  "success.sealAnother": "Başka bir konuşma mühürle",
  "receipts.title": "Makbuzlarım",
  "receipts.subtitle": "Atıf kodlarınızı bulmak için mühürlerken kullandığınız e-postayı girin.",
  "receipts.action": "Bul",
  "receipts.empty": "Bu e-posta için henüz atıf bulunamadı.",
  "receipts.notConfigured": "Bu sitede saklanan makbuzlar henüz mevcut değil.",
  "feedback.title": "Geri Bildirim & Öneriler",
  "feedback.subtitle": "Neyi iyileştirmemiz gerektiğini söyleyin, bir sorun bildirin veya bir fikir paylaşın. Her şeyi okuyoruz.",
  "feedback.type.label": "Ne tür bir geri bildirim?",
  "feedback.type.suggestion": "Öneri",
  "feedback.type.bug": "Sorun",
  "feedback.type.praise": "Övgü",
  "feedback.type.other": "Diğer",
  "feedback.message.label": "Mesajınız",
  "feedback.message.placeholder": "Aklınızda ne var? Ne kadar net olursa o kadar iyi.",
  "feedback.email.label": "E-posta (isteğe bağlı)",
  "feedback.email.help": "Yalnızca yanıt isterseniz. Başka bir amaçla kullanmayız.",
  "feedback.submit": "Geri Bildirim Gönder",
  "feedback.sending": "Gönderiliyor…",
  "feedback.error.empty": "Lütfen bir mesaj girin.",
  "feedback.error.generic": "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
  "feedback.thanks.title": "Teşekkürler!",
  "feedback.thanks.body": "Geri bildiriminiz alındı. DeCite'ı şekillendirmeye gerçekten yardımcı oluyor.",
  "feedback.thanks.again": "Daha fazla gönder",
  "feedback.thanks.home": "Ana sayfaya dön",
  // ─── FAQ ──────────────────────────────────────────────────────────────────
  "faq.title": "Sıkça sorulan sorular",
  "faq.subtitle":
    "Bir AI sohbetini mühürlemek, ona atıf vermek ve kanıtın sonsuza dek okunabilir kalması hakkında her şey. Sorunuzu bulamadınız mı? Geri Bildirim üzerinden gönderin — her şeyi yanıtlıyoruz.",
  "faq.group.about": "DeCite hakkında",
  "faq.group.sealing": "Bir sohbeti mühürlemek",
  "faq.group.citation": "Atfınız",
  "faq.group.readers": "Okuyucular ve hakemler için",
  "faq.group.trust": "Kalıcılık ve güven",
  "faq.group.privacy": "Gizlilik ve güvenlik",
  "faq.stillTitle": "Hâlâ bir sorunuz mu var?",
  "faq.stillBody":
    "Burada yanıtını bulamadıysanız doğrudan bize sorun — her mesajı okuyoruz ve genellikle bir gün içinde yanıtlıyoruz.",
  "faq.stillCta": "Soru sor",
  "faq.sealCta": "Bir diyaloğu mühürle",

  "faq.q.what": "DeCite nedir?",
  "faq.a.what":
    "DeCite, bir AI ile yaptığınız sohbeti kalıcı bir kamuya açık kayda kaydeder ve size makalenize, kitabınıza veya yazınıza koyabileceğiniz DC-20260619-01 gibi kısa bir atıf kodu verir. Koda sahip olan herkes daha sonra onu sorgulayıp, kaydedildiği tarih ve saatle birlikte tam o sohbeti kelimesi kelimesine okuyabilir. Kaybolabilecek bir sohbeti, her zaman doğrulanabilen bir kaynağa dönüştürür.",
  "faq.q.who": "Kimler için?",
  "faq.a.who":
    "Düşüncesi bir AI ile sohbette biçimlenen ve bunu dürüstçe kaynak göstermek isteyen herkes için — araştırmacılar, öğrenciler, yazarlar, gazeteciler ve eğitimciler. Yazarlar bunu atıf verilebilir, kalıcı bir kayıt oluşturmak için kullanır; okuyucular, hakemler ve editörler ise AI'ya tam olarak ne sorulduğunu ve onun ne yanıtladığını doğrulamak için kullanır.",
  "faq.q.free": "Gerçekten ücretsiz mi? Bir bit yeniği var mı?",
  "faq.a.free":
    "Lansman süresince mühürleme ücretsizdir — hesap yok, kart yok, gizli adım yok. Her sohbeti kaydetme ve kalıcı olarak tescil etme maliyetini sizin için biz karşılıyoruz. Bu durum ileride değişirse, herhangi bir şeyi mühürlemeden önce fiyat açıkça gösterilir ve zaten mühürlenmiş sohbetler sonsuza dek mühürlü kalır.",

  "faq.q.how": "Bir sohbeti nasıl mühürlerim?",
  "faq.a.how":
    "AI sohbetinizin herkese açık bir paylaşım linkini ya da sohbet metninin kendisini yapıştırın, nerede kullanacağınıza dair kısa bir başlık ekleyin ve Mühürle'ye tıklayın. Birkaç saniye içinde DeCite sohbeti kalıcı bir arşive kaydeder, atıf kodunuzu ayırır ve herkese açık bir kayda işler. Atfı hemen görürsünüz; adresinizi eklerseniz e-posta ile de göndeririz.",
  "faq.q.linkVsPaste": "«Resmî Paylaşım Linki» ile «Doğrudan Metni Yapıştır» arasındaki fark nedir?",
  "faq.a.linkVsPaste":
    "AI'nız herkesin açabileceği herkese açık bir link verdiğinde Resmî Paylaşım Linki'ni kullanın — DeCite sohbeti oradan okur ve kalıcı bir kopya kaydeder. Herkese açık bir link yoksa Doğrudan Metni Yapıştır'ı kullanın: sohbet metnini kendiniz yapıştırırsınız ve DeCite tam olarak yapıştırdığınızı kaydeder. İkisi de aynı tür kalıcı, atıf verilebilir kaydı oluşturur.",
  "faq.q.platforms": "Hangi AI platformları destekleniyor?",
  "faq.a.platforms":
    "Herkese açık paylaşım linkleri ChatGPT, Claude, Grok, Copilot, Perplexity, Poe, Mistral, Meta AI, Qwen ve daha fazlasında çalışır. Herkese açık link sunmayan herhangi bir AI için — ya da yapıştırmayı tercih ettiğiniz özel bir sohbet için — bu listede olmayanlar dahil her araçla çalışan Doğrudan Metni Yapıştır'ı kullanın.",
  "faq.q.gemini": "Gemini veya DeepSeek bana herkese açık link vermiyor. Ne yapmalıyım?",
  "faq.a.gemini":
    "Bazı platformlar sohbeti tarayıcınızın içinde tutar, bu yüzden bir link dışarıdaki okuyucular tarafından okunamaz. Sohbeti açın, metni seçip kopyalayın, sonra Doğrudan Metni Yapıştır'a geçip yapıştırın. DeCite tam olarak yapıştırdığınızı kaydeder. Atfınızın hangi AI'yı kullandığınızı kaydetmesi için isteğe bağlı alana orijinal sohbet linkini de ekleyebilirsiniz.",
  "faq.q.account": "Hesaba, ödemeye veya kripto cüzdana ihtiyacım var mı?",
  "faq.a.account":
    "Hayır. Kayıt yok, kart yok, kurulacak bir şey yok. Cüzdana ya da teknik bilgiye ihtiyacınız yok — DeCite kaydetme ve tescili perde arkasında sizin için halleder. E-posta isteğe bağlıdır ve yalnızca atfı size göndermek ve sonradan tekrar bulmanızı sağlamak için kullanılır.",
  "faq.q.time": "Mühürleme ne kadar sürer?",
  "faq.a.time":
    "Genellikle yalnızca birkaç saniye. Çalışırken sayfayı açık tutun — DeCite sohbeti kalıcı bir arşive kaydediyor, kodunuzu ayırıyor ve herkese açık kayda işliyor. Bittiğinde atfınızı hemen görürsünüz.",
  "faq.q.language": "Herhangi bir dildeki sohbeti mühürleyebilir miyim?",
  "faq.a.language":
    "Evet. DeCite sohbet metnini her dilde ve her yazıda olduğu gibi kaydeder. Arayüzün kendisi birkaç dilde mevcuttur — üst çubuktaki dil menüsünden istediğiniz zaman değiştirin.",

  "faq.q.code": "Atıf kodu nasıl görünür?",
  "faq.a.code":
    "DC-YYYYAAGG-NN biçiminde kısa, temiz bir koddur — örneğin DC-20260619-01, yani 19 Haziran 2026'da mühürlenen ilk sohbet. Kaynakçaya yazması kolay, okuyucunun sorgulaması da kolaydır.",
  "faq.q.cite": "Makalemde veya kitabımda buna nasıl atıf veririm?",
  "faq.a.cite":
    "Bir sohbeti mühürlediğinizde DeCite size atıf kodu ve herkese açık kayıt linkiyle birlikte, doğrudan kaynakçanıza kopyalayabileceğiniz APA 7 biçiminde hazır bir künye verir. Bunu derginizin veya yayıncınızın istediği herhangi bir biçime uyarlamakta özgürsünüz.",
  "faq.q.edit": "Mühürledikten sonra sohbeti düzenleyebilir veya güncelleyebilir miyim?",
  "faq.a.edit":
    "Hayır — ve bütün mesele de bu. Mühürlenmiş bir sohbeti biz dahil hiç kimse değiştiremez ve onu atıf olarak güvenilir kılan tam olarak budur. Sohbet devam ettiyse veya daha yeni bir sürümü kaydetmek isterseniz, ayrı bir atıf almak için onu yeniden mühürlemeniz yeterlidir.",
  "faq.q.lost": "Atıf kodumu kaybettim. Onu tekrar nasıl bulurum?",
  "faq.a.lost":
    "Mühürlerken e-postanızı eklediyseniz, Makbuzlarım'a gidip aynı e-postayı girerek ona bağlı tüm atıf kodlarını görebilirsiniz. E-posta eklemediyseniz, sohbeti sorgulamak için kodun kendisine ihtiyacınız olur — bu yüzden onu güvenli bir yerde saklayın.",

  "faq.q.lookup": "Birisi atfımı nasıl sorgular?",
  "faq.a.lookup":
    "Sorgula sayfasına gider, atıf kodunu yazar ve tam o mühürlenmiş sohbet açılır — tam metin, mühürlendiği tarih ve saat ve hangi AI'nın kullanıldığı. Okumak için hesap veya ödeme gerekmez.",
  "faq.q.readerAccount": "Okuyucuların veya hakemlerin doğrulamak için hesaba ihtiyacı var mı?",
  "faq.a.readerAccount":
    "Hayır. Koda sahip olan herkes sohbeti ücretsiz ve kayıt olmadan okuyabilir. Kayıt aynı zamanda tek bir şirketin denetlemediği bağımsız kamuya açık altyapıda da bulunduğundan, kararlı bir hakem onu DeCite sitesini hiç kullanmadan bile doğrulayabilir.",

  "faq.q.where": "Sohbet aslında nerede saklanıyor?",
  "faq.a.where":
    "Tek bir şirketin denetlemediği iki bağımsız kamuya açık yerde: tüm sohbeti tutan kalıcı bir kamuya açık arşivde ve atıf kodunu ile mühürlendiği anı kaydeden herkese açık bir kayıtta. DeCite yalnızca ikisine açılan kullanışlı bir penceredir — kaydın var olması bize bağlı değildir.",
  "faq.q.ifGone": "DeCite bir gün ortadan kalkarsa ne olur?",
  "faq.a.ifGone":
    "Atıflarınız çalışmaya devam eder. Her biri bağımsız kamuya açık altyapıda saklandığından, herkes herkese açık kaydı ve kalıcı arşivi yine doğrudan açabilir — web sitesi, hesap veya izin gerekmez. Kanıt şirketten daha uzun yaşar.",
  "faq.q.timestamp": "Tarih ve saatin güvenilir olduğunu nasıl bilirim?",
  "faq.a.timestamp":
    "Bir sohbet mühürlendiğinde, tam tarih ve saat sonradan sessizce değiştirilemeyen herkese açık bir kayda yazılır. Yani zaman yalnızca bizim sözümüz değildir — herkes onu bağımsız olarak kontrol edebilir ve incelemeye dayanmasını sağlayan da budur.",

  "faq.q.public": "Mühürlenmiş sohbet herkese açık mı? Onu kim görebilir?",
  "faq.a.public":
    "Evet. Mühürlenmiş bir sohbet atıf verilebilir olmak içindir, bu yüzden atıf koduna sahip olan herkes onu okuyabilir ve kalıcı olarak herkese açık kalır. Yalnızca sonsuza dek herkese açık yapmaktan rahat olduğunuz sohbetleri mühürleyin.",
  "faq.q.sensitive": "Sohbetteki kişisel veya gizli bilgiler ne olacak?",
  "faq.a.sensitive":
    "Mühürleme kalıcı ve herkese açık olduğundan, mühürlemeden önce özel veya hassas her şeyi kaldırın — isimler, iletişim bilgileri, yayımlanmamış veriler, her türlü gizli bilgi. Bir sohbet mühürlendikten sonra ne düzenlenebilir ne de kaldırılabilir, bu yüzden metni önce dikkatle gözden geçirin.",
  "faq.q.email": "E-postamı saklıyor musunuz, ne için?",
  "faq.a.email":
    "E-posta isteğe bağlıdır. Verirseniz, onu yalnızca atfınızı göndermek ve kodlarınızı Makbuzlarım'da tekrar bulmanızı sağlamak için kullanırız. Herkese açık kaydın parçası değildir ve başka hiçbir şey için kullanmayız.",

  // ─── Latest citations + share toggle ──────────────────────────────────────
  "nav.latest": "En Yeniler",
  "nav.more": "Daha fazla",
  "mint.share.label": "Herkese açık «Son atıflar» listesine ekle",
  "mint.share.help":
    "Varsayılan olarak açık. Koda sahip olan herkes mühürlenmiş bir atfı zaten okuyabilir; bu yalnızca başkalarının keşfedebilmesi için onu herkese açık biçimde listeler. Listeden çıkarmak için kapatın.",
  "latest.title": "Son atıflar",
  "latest.subtitle":
    "Yazarlarının herkese açık paylaşmayı seçtiği, yakın zamanda mühürlenmiş sohbetler. Arkasındaki tam diyaloğu okumak için herhangi birini açın.",
  "latest.loading": "Son atıflar yükleniyor…",
  "latest.empty": "Henüz herkese açık atıf yok — birini mühürleyin, burada görünebilir.",
  "latest.notConfigured": "Herkese açık liste bu sitede henüz mevcut değil.",
  "latest.error": "Liste şu anda yüklenemedi. Lütfen tekrar deneyin.",
  "latest.anon": "Anonim",
  "latest.viewAll": "Tümünü gör",
  "latest.sealCta": "Bir diyaloğu mühürle",

  "footer.note": "Kalıcı · Zaman damgalı · Bağımsız doğrulanabilir",
  "common.user": "Kullanıcı",
  "common.assistant": "Asistan",
};

const DICTS: Record<Locale, Dict> = {
  en, zh, hi, es, fr, ar, pt, ru, de, ja, tr,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "decite.locale";

function applyDir(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    let cancelled = false;
    const apply = (l: Locale) => {
      if (cancelled || !(l in DICTS)) return;
      setLocaleState(l);
      applyDir(l);
    };

    // An explicit choice always wins and is never overridden by detection.
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in DICTS) {
      if (saved !== "en") apply(saved);
      return;
    }

    // No choice yet → pick a language from the visitor's location.
    // 1) Instant, offline guess from the browser's languages (avoids a flash).
    const guess = localeFromLanguages(
      typeof navigator !== "undefined"
        ? (navigator.languages ?? [navigator.language])
        : null,
    );
    if (guess) apply(guess);

    // 2) Authoritative, location-aware resolution (geo-IP country first), unless
    //    the visitor has since made an explicit choice.
    fetch("/api/locale")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { locale?: string } | null) => {
        const l = data?.locale;
        if (!l || !(l in DICTS)) return;
        if (window.localStorage.getItem(STORAGE_KEY)) return;
        apply(l as Locale);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    applyDir(l);
  }, []);

  const t = useCallback(
    (key: string): string => DICTS[locale][key] ?? en[key] ?? key,
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
