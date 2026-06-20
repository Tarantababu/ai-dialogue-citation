"use server";

import { recordFeedback, kvConfigured } from "@/lib/kv";
import { limitByIp } from "@/lib/ratelimit";
import { sendFeedbackNotification, sendFeedbackAck } from "@/lib/email";
import type { FeedbackType } from "@/lib/types";

const TYPES: FeedbackType[] = ["suggestion", "bug", "praise", "other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 4000;

export type FeedbackResult = { ok: true } | { ok: false; error: string };

/** Store a feedback / suggestion submission (rate-limited, KV-backed). */
export async function submitFeedback(input: {
  type: string;
  message: string;
  email?: string;
}): Promise<FeedbackResult> {
  const message = input.message?.trim();
  if (!message) {
    return { ok: false, error: "Please enter a message." };
  }
  if (message.length > MAX_LEN) {
    return { ok: false, error: "Message is too long (4000 characters max)." };
  }

  const type: FeedbackType = TYPES.includes(input.type as FeedbackType)
    ? (input.type as FeedbackType)
    : "other";

  const email = input.email?.trim() || null;
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email, or leave it blank." };
  }

  if (!kvConfigured) {
    return {
      ok: false,
      error: "Feedback isn't enabled on this deployment (storage not configured).",
    };
  }

  const gate = await limitByIp("feedback", 8);
  if (!gate.ok) return { ok: false, error: gate.error };

  try {
    await recordFeedback({ type, message, email, ts: Math.floor(Date.now() / 1000) });
    // Notify the operator, and acknowledge the sender (both best-effort).
    await sendFeedbackNotification({ type, message, email });
    if (email) await sendFeedbackAck(email);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save your feedback.",
    };
  }
}
