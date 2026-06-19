import type { Metadata } from "next";
import { getFeedback } from "@/lib/kv";

export const metadata: Metadata = { title: "Feedback admin", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * Minimal, env-key-gated view of submitted feedback. Set FEEDBACK_ADMIN_KEY in
 * the server env, then open /admin/feedback?key=YOUR_KEY. Not linked anywhere.
 */
export default async function FeedbackAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const expected = process.env.FEEDBACK_ADMIN_KEY;

  if (!expected || key !== expected) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Not authorized
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Append <code className="font-mono">?key=…</code> matching
          FEEDBACK_ADMIN_KEY.
        </p>
      </div>
    );
  }

  const items = await getFeedback(500);

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="mb-1 font-serif text-3xl font-semibold text-foreground">
        Feedback
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {items.length} submission{items.length === 1 ? "" : "s"} · most recent first
      </p>
      {items.length === 0 ? (
        <p className="text-muted-foreground">No feedback yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((f, i) => (
            <li
              key={i}
              className="rounded-md border border-border bg-card p-4 text-sm"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-sm bg-accent px-2 py-0.5 font-medium uppercase tracking-wide text-accent-foreground">
                  {f.type}
                </span>
                <span>{new Date(f.ts * 1000).toLocaleString()}</span>
                {f.email && <span className="font-mono">{f.email}</span>}
              </div>
              <p className="whitespace-pre-wrap text-foreground">{f.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
