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

/**
 * Minimal, dependency-free i18n.
 * English is the default & fallback locale; Turkish and Spanish are bundled.
 * Strings are flat dot-keyed for ergonomic lookup: t("home.hero.title").
 */

export type Locale = "en" | "tr" | "es";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "es", label: "Español" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "brand.name": "Sıfır Düşüş Protocol",
  "brand.tagline": "AI Dialogue Blockchain Citation & Verification",

  "nav.home": "Manifesto",
  "nav.mint": "Seal a Dialogue",
  "nav.verify": "Verify",
  "nav.language": "Language",

  "cta.mint.title": "Author Minter",
  "cta.mint.desc": "Seal a human–AI collaboration permanently and mint its citation code.",
  "cta.mint.action": "Enter the Minter",
  "cta.verify.title": "Reader Verification",
  "cta.verify.desc": "Resolve any citation code against the immutable on-chain registry.",
  "cta.verify.action": "Open Verification",

  "home.eyebrow": "Intellectual honesty, sealed on-chain",
  "home.hero.title": "Cite the machine you thought with.",
  "home.hero.lede":
    "Scholarship is entering an age where ideas are forged in dialogue with artificial intelligence. Yet those conversations vanish, mutate, or are quietly disowned. The Sıfır Düşüş Protocol gives authors a way to permanently seal a human–AI collaboration — preserved on IPFS, timestamped on Polygon, and cited with a single human-readable code.",
  "home.crisis.title": "The crisis of disappearing provenance",
  "home.crisis.body":
    "When a share link rots or a platform deletes a thread, the intellectual record collapses. A reviewer cannot confirm what was asked, what was answered, or when. Attribution becomes hearsay. Sıfır Düşüş — \"Zero Drop\" — guarantees that the record never falls: the sealed dialogue remains readable even if the origin platform forgets it ever existed.",
  "home.pillars.permanence.title": "Permanence",
  "home.pillars.permanence.body": "Content-addressed on IPFS. The CID is the proof; tampering changes the address.",
  "home.pillars.timestamp.title": "Immutable timestamp",
  "home.pillars.timestamp.body": "A Polygon transaction fixes the moment of sealing beyond dispute.",
  "home.pillars.citation.title": "Human-readable citation",
  "home.pillars.citation.body": "Every seal yields a code like BC-SD-20260619-01 for books and papers.",
  "home.quote":
    "A citation is a promise that the source can be found. We are simply keeping the promise.",

  "mint.title": "Seal a Dialogue",
  "mint.subtitle": "Pin the conversation to IPFS, then notarize it on Polygon.",
  "mint.tab.link": "Official Share Link",
  "mint.tab.paste": "Direct Text Capture",
  "mint.link.label": "AI share URL",
  "mint.link.placeholder": "https://chatgpt.com/share/… or https://claude.ai/share/…",
  "mint.link.help": "Paste an official public share link from ChatGPT or Claude.",
  "mint.paste.label": "Conversation text or Markdown",
  "mint.paste.placeholder": "Paste the raw dialogue here. Prefix turns with 'User:' and 'Assistant:' when possible.",
  "mint.paste.help": "Use this when the platform offers no public share link.",
  "mint.sourceRef.label": "Bibliographic reference (work title)",
  "mint.sourceRef.placeholder": "e.g. On the Ethics of Synthetic Reasoning (2026), Ch. 3",
  "mint.author.label": "Author name for citation (optional)",
  "mint.author.placeholder": "e.g. Yiğit Aydın",
  "mint.step.pin": "Pinning to IPFS",
  "mint.step.code": "Reserving citation code",
  "mint.step.sign": "Awaiting wallet signature",
  "mint.step.confirm": "Confirming on Polygon",
  "mint.action.seal": "Seal & Mint Citation",
  "mint.action.sealing": "Sealing…",
  "mint.connectFirst": "Connect a Polygon wallet to seal.",
  "mint.success.title": "Sealed & Notarized",
  "mint.success.desc": "Your collaboration is permanent. Copy the APA citation for your bibliography.",
  "mint.success.code": "Citation code",
  "mint.success.tx": "Transaction",
  "mint.success.apa": "APA reference",
  "mint.copy": "Copy",
  "mint.copied": "Copied",
  "mint.viewVerify": "View verification page",
  "mint.error.badLink": "Enter a valid ChatGPT or Claude share URL.",
  "mint.error.empty": "Please provide the conversation content.",
  "mint.error.sourceRef": "Please provide a bibliographic reference.",
  "mint.warn.noContract": "No contract address is configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local.",

  "verify.title": "Verify a Citation",
  "verify.subtitle": "Resolve a code against the immutable registry.",
  "verify.input.placeholder": "Enter a citation code, e.g. BC-SD-20260619-01",
  "verify.action": "Verify",
  "verify.error.format": "That does not look like a valid citation code (BC-SD-YYYYMMDD-NN).",
  "verify.error.notFound": "No sealed citation exists for this code.",
  "verify.error.config": "The verification engine is not configured. Set the contract address and RPC URL.",
  "verify.loading": "Interrogating the on-chain registry…",
  "verify.sealed": "SEALED & VERIFIED",
  "verify.meta.title": "Registry metadata",
  "verify.meta.timestamp": "Block timestamp",
  "verify.meta.author": "Author address",
  "verify.meta.registry": "Registry address",
  "verify.meta.origin": "Origin input type",
  "verify.meta.cid": "IPFS CID",
  "verify.meta.code": "Citation code",
  "verify.origin.link": "Live original AI conversation",
  "verify.origin.open": "Open the original (external)",
  "verify.origin.warn": "External link — the origin platform may have altered or removed this thread.",
  "verify.ipfs.title": "Immutable archive (IPFS)",
  "verify.ipfs.desc": "Read directly from the content-addressed network — guaranteed even if the origin is deleted.",
  "verify.ipfs.open": "Open raw file",
  "verify.role.user": "User",
  "verify.role.assistant": "Assistant",
  "verify.back": "Verify another code",

  "footer.note": "Sealed on IPFS · Notarized on Polygon",
  "common.user": "User",
  "common.assistant": "Assistant",
};

const tr: Dict = {
  "brand.tagline": "Yapay Zekâ Diyaloğu Blok Zinciri Atıf & Doğrulama",
  "nav.home": "Manifesto",
  "nav.mint": "Diyalog Mühürle",
  "nav.verify": "Doğrula",
  "nav.language": "Dil",
  "cta.mint.title": "Yazar Mühürleme",
  "cta.mint.desc": "İnsan–YZ iş birliğini kalıcı olarak mühürleyin ve atıf kodunu üretin.",
  "cta.mint.action": "Mühürlemeye Geç",
  "cta.verify.title": "Okuyucu Doğrulama",
  "cta.verify.desc": "Herhangi bir atıf kodunu değiştirilemez zincir kaydında çözümleyin.",
  "cta.verify.action": "Doğrulamayı Aç",
  "home.eyebrow": "Entelektüel dürüstlük, zincire mühürlendi",
  "home.hero.title": "Birlikte düşündüğün makineye atıf yap.",
  "home.hero.lede":
    "Bilim, fikirlerin yapay zekâ ile diyalog içinde şekillendiği bir çağa giriyor. Ancak bu konuşmalar kayboluyor, değişiyor veya sessizce reddediliyor. Sıfır Düşüş Protokolü, yazarlara bir insan–YZ iş birliğini kalıcı olarak mühürleme imkânı verir: IPFS'te saklanır, Polygon'da zaman damgalı, tek bir okunabilir kodla atıf yapılır.",
  "home.crisis.title": "Kaybolan kaynak kökeni krizi",
  "home.crisis.body":
    "Bir paylaşım bağlantısı çürüdüğünde veya bir platform konuşmayı sildiğinde entelektüel kayıt çöker. Sıfır Düşüş bunu garanti eder: mühürlenmiş diyalog, köken platform onu unutsa bile okunabilir kalır.",
  "home.pillars.permanence.title": "Kalıcılık",
  "home.pillars.permanence.body": "IPFS'te içerik adresli. CID kanıttır; kurcalama adresi değiştirir.",
  "home.pillars.timestamp.title": "Değiştirilemez zaman damgası",
  "home.pillars.timestamp.body": "Bir Polygon işlemi mühürleme anını tartışmasız sabitler.",
  "home.pillars.citation.title": "Okunabilir atıf",
  "home.pillars.citation.body": "Her mühür, kitaplar için BC-SD-20260619-01 gibi bir kod üretir.",
  "home.quote": "Atıf, kaynağın bulunabileceğine dair bir sözdür. Biz yalnızca sözü tutuyoruz.",
  "mint.title": "Diyalog Mühürle",
  "mint.subtitle": "Konuşmayı IPFS'e sabitleyin, ardından Polygon'da noterleyin.",
  "mint.tab.link": "Resmî Paylaşım Linki",
  "mint.tab.paste": "Doğrudan Metin Kopyalama",
  "mint.link.label": "YZ paylaşım adresi",
  "mint.link.placeholder": "https://chatgpt.com/share/… veya https://claude.ai/share/…",
  "mint.link.help": "ChatGPT veya Claude'dan resmî herkese açık bağlantıyı yapıştırın.",
  "mint.paste.label": "Konuşma metni veya Markdown",
  "mint.paste.placeholder": "Ham diyaloğu buraya yapıştırın. Mümkünse 'User:' ve 'Assistant:' ile başlayın.",
  "mint.paste.help": "Platform herkese açık bağlantı sunmuyorsa bunu kullanın.",
  "mint.sourceRef.label": "Bibliyografik künye (eser başlığı)",
  "mint.sourceRef.placeholder": "örn. Sentetik Akıl Yürütmenin Etiği (2026), Böl. 3",
  "mint.author.label": "Atıf için yazar adı (isteğe bağlı)",
  "mint.author.placeholder": "örn. Yiğit Aydın",
  "mint.action.seal": "Mühürle & Atıf Üret",
  "mint.action.sealing": "Mühürleniyor…",
  "mint.connectFirst": "Mühürlemek için bir Polygon cüzdanı bağlayın.",
  "mint.success.title": "Mühürlendi & Noterlendi",
  "mint.success.desc": "İş birliğiniz kalıcıdır. Kaynakçanız için APA atfını kopyalayın.",
  "mint.success.code": "Atıf kodu",
  "mint.success.tx": "İşlem",
  "mint.success.apa": "APA künyesi",
  "mint.copy": "Kopyala",
  "mint.copied": "Kopyalandı",
  "mint.viewVerify": "Doğrulama sayfasını gör",
  "verify.title": "Atıf Doğrula",
  "verify.subtitle": "Bir kodu değiştirilemez kayıtta çözümleyin.",
  "verify.input.placeholder": "Atıf kodu girin, örn. BC-SD-20260619-01",
  "verify.action": "Doğrula",
  "verify.sealed": "MÜHÜRLÜ & DOĞRULANMIŞTIR",
  "verify.meta.title": "Kayıt üst verisi",
  "verify.meta.timestamp": "Blok zaman damgası",
  "verify.meta.author": "Yazar adresi",
  "verify.meta.registry": "Kayıt sözleşmesi adresi",
  "verify.meta.origin": "Köken giriş türü",
  "verify.meta.cid": "IPFS CID",
  "verify.meta.code": "Atıf kodu",
  "verify.origin.link": "Canlı orijinal YZ konuşması",
  "verify.origin.open": "Orijinali aç (harici)",
  "verify.ipfs.title": "Değiştirilemez arşiv (IPFS)",
  "verify.ipfs.open": "Ham dosyayı aç",
  "verify.back": "Başka bir kod doğrula",
  "footer.note": "IPFS'te mühürlendi · Polygon'da noterlendi",
};

const es: Dict = {
  "brand.tagline": "Citación y Verificación de Diálogos IA en Blockchain",
  "nav.home": "Manifiesto",
  "nav.mint": "Sellar Diálogo",
  "nav.verify": "Verificar",
  "nav.language": "Idioma",
  "cta.mint.title": "Sellado de Autor",
  "cta.mint.desc": "Sella permanentemente una colaboración humano–IA y genera su código de cita.",
  "cta.mint.action": "Entrar al Sellado",
  "cta.verify.title": "Verificación del Lector",
  "cta.verify.desc": "Resuelve cualquier código de cita contra el registro inmutable en cadena.",
  "cta.verify.action": "Abrir Verificación",
  "home.eyebrow": "Honestidad intelectual, sellada en cadena",
  "home.hero.title": "Cita a la máquina con la que pensaste.",
  "home.hero.lede":
    "La erudición entra en una era donde las ideas se forjan en diálogo con la inteligencia artificial. Pero esas conversaciones desaparecen o se alteran. El Protocolo Sıfır Düşüş permite a los autores sellar permanentemente una colaboración humano–IA: preservada en IPFS, sellada en el tiempo en Polygon y citada con un único código legible.",
  "home.crisis.title": "La crisis de la procedencia que desaparece",
  "home.crisis.body":
    "Cuando un enlace caduca o una plataforma borra un hilo, el registro intelectual colapsa. Sıfır Düşüş garantiza que el diálogo sellado permanezca legible aunque la plataforma de origen lo olvide.",
  "home.pillars.permanence.title": "Permanencia",
  "home.pillars.permanence.body": "Direccionado por contenido en IPFS. El CID es la prueba.",
  "home.pillars.timestamp.title": "Marca de tiempo inmutable",
  "home.pillars.timestamp.body": "Una transacción de Polygon fija el momento del sellado.",
  "home.pillars.citation.title": "Cita legible",
  "home.pillars.citation.body": "Cada sello genera un código como BC-SD-20260619-01.",
  "home.quote": "Una cita es la promesa de que la fuente puede encontrarse. Solo cumplimos la promesa.",
  "mint.title": "Sellar un Diálogo",
  "mint.subtitle": "Fija la conversación en IPFS y luego certifícala en Polygon.",
  "mint.tab.link": "Enlace Oficial",
  "mint.tab.paste": "Captura Directa de Texto",
  "mint.action.seal": "Sellar y Generar Cita",
  "mint.action.sealing": "Sellando…",
  "verify.title": "Verificar una Cita",
  "verify.input.placeholder": "Introduce un código, p. ej. BC-SD-20260619-01",
  "verify.action": "Verificar",
  "verify.sealed": "SELLADO Y VERIFICADO",
  "verify.back": "Verificar otro código",
  "footer.note": "Sellado en IPFS · Certificado en Polygon",
};

const DICTS: Record<Locale, Dict> = { en, tr, es };

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "sdp.locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // Hydration sync: SSR always renders the default ("en") locale; after mount
    // we adopt the visitor's previously chosen locale from localStorage.
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in DICTS && saved !== "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time post-mount external-store sync
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
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
