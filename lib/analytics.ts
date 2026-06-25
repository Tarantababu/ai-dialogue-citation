"use client";

/**
 * Thin, type-safe wrapper over Umami's `umami.track()`.
 *
 * Calls are safe before the script has loaded - or when an ad/tracker blocker
 * stops it loading at all - in which case they become silent no-ops. Analytics
 * must never throw into the app.
 *
 * Events are grouped by user journey so the Umami dashboard reads as a set of
 * funnels rather than a flat event list:
 *
 *   1. Seal a dialogue   - the core conversion funnel
 *   2. Cite & share      - what people do right after sealing
 *   3. Verify a citation - the reader side (someone followed a citation)
 *   4. Discovery         - browsing the public feed
 *   5. Feedback          - voice-of-customer
 */

type EventData = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: EventData) => void;
    };
  }
}

function track(event: string, data?: EventData) {
  if (typeof window === "undefined") return;
  try {
    // Strip undefined so they don't surface as the literal "undefined" in Umami.
    const clean = data
      ? Object.fromEntries(
          Object.entries(data).filter(([, v]) => v !== undefined),
        )
      : undefined;
    window.umami?.track(event, clean as EventData | undefined);
  } catch {
    // Swallow - a tracking failure must not affect the user.
  }
}

export const analytics = {
  // ── Journey 1: Seal a dialogue (core conversion) ─────────────────────
  /** User flipped between the "share link" and "paste text" input modes. */
  sealTabSwitched: (tab: "link" | "paste") =>
    track("seal_tab_switched", { tab }),

  /** Form passed validation and a seal attempt was submitted (top of funnel). */
  sealStarted: (p: {
    method: "share-link" | "direct-paste";
    mode: "free" | "paid";
    listPublicly: boolean;
    hasAuthor: boolean;
    hasEmail: boolean;
  }) => track("seal_started", p),

  /** Seal attempt failed before completion. */
  sealFailed: (p: { stage: "free" | "checkout"; reason?: string }) =>
    track("seal_failed", p),

  /** Paid mode only: user is being sent to Stripe checkout. */
  sealCheckoutRedirect: () => track("seal_checkout_redirect", { mode: "paid" }),

  /** Returned from a canceled Stripe checkout. */
  sealCanceled: () => track("seal_canceled"),

  /** Success screen shown - a citation now exists. Covers free AND paid. */
  sealFinalized: (p: { code: string; platform?: string; hasAuthor: boolean }) =>
    track("seal_finalized", p),

  // ── Journey 2: Cite & share (post-seal) ──────────────────────────────
  /** Copied the ready-to-paste citation from the success screen. */
  successCitationCopied: () => track("success_citation_copied"),
  /** Followed the "view verification page" link from the success screen. */
  successViewVerification: () => track("success_view_verification"),
  /** Clicked "seal another" - a returning-creator signal. */
  successSealAnother: () => track("success_seal_another"),

  // ── Journey 3: Verify a citation (reader side) ───────────────────────
  /** Submitted a code on the /dogrulama lookup form. */
  verifySearched: () => track("verify_searched"),
  /** A verification page rendered. status: ok | not-found | unconfigured | error. */
  verifyResultViewed: (p: { status: string; code: string }) =>
    track("verify_result_viewed", p),
  /** Copied a formatted citation from the verification page. */
  citationCopied: (p: { style: string }) => track("citation_copied", p),
  /** Switched academic citation style (APA, MLA, ...). */
  citationStyleChanged: (p: { style: string }) =>
    track("citation_style_changed", p),
  /** Opened an external proof link. target: ipfs | origin | registry | custodian. */
  externalOpened: (target: "ipfs" | "origin" | "registry" | "custodian") =>
    track("external_opened", { target }),

  // ── Journey 4: Discovery (public feed) ───────────────────────────────
  /** Clicked an entry in the "latest citations" feed. */
  latestCitationClicked: (p: { code: string; platform?: string }) =>
    track("latest_citation_clicked", p),

  // ── Journey 5: Feedback ──────────────────────────────────────────────
  /** Feedback form submitted. type: suggestion | bug | praise | other. */
  feedbackSubmitted: (p: { type: string }) =>
    track("feedback_submitted", p),
};
