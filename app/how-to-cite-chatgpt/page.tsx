import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Link2Off, FileText, ShieldCheck } from "lucide-react";

/**
 * Cornerstone SEO page. Server-rendered in English (not behind the client i18n
 * layer) so the full text is crawlable. Targets the high-volume query "how to
 * cite ChatGPT" and its real pain point: the conversation you must cite won't
 * stay retrievable. Leads with permanence/verifiability; treats the underlying
 * registries as an implementation detail, per the GTM research.
 */
export const metadata: Metadata = {
  title: "How to Cite ChatGPT (When the Share Link Breaks)",
  description:
    "A practical guide to citing an AI conversation so it actually holds up: how APA, MLA, and others handle ChatGPT, why share links break, and how to preserve the exact conversation permanently.",
  alternates: { canonical: "/how-to-cite-chatgpt" },
  openGraph: {
    title: "How to Cite ChatGPT (When the Share Link Breaks)",
    description:
      "Why AI share links rot, what APA and MLA actually say, and how to preserve and cite an AI conversation permanently.",
    type: "article",
  },
};

export default function HowToCiteChatGptPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <header className="text-center">
        <p className="eyebrow mb-3">Honest attribution for the age of AI</p>
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
          How to cite ChatGPT when the share link breaks
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Disclosure of AI use is now expected by most journals and supervisors.
          But the one source you have to cite, the conversation itself, is also
          the one that won&rsquo;t stay put. Here&rsquo;s how to cite it so it
          actually holds up.
        </p>
      </header>

      <div className="hairline my-12" />

      {/* Why this is hard */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Link2Off className="h-5 w-5 shrink-0 text-bronze" strokeWidth={1.5} />
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Why citing an AI conversation is different
          </h2>
        </div>
        <p className="leading-relaxed text-muted-foreground">
          A citation is a promise that the source can be found. With a book or a
          web page, that&rsquo;s easy: the source sits still. An AI conversation
          doesn&rsquo;t. It is private to your account by default, it can be
          edited or continued, and it has no stable public address.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          ChatGPT&rsquo;s &ldquo;Share&rdquo; feature looks like the answer, but a
          shared link <strong className="font-semibold text-foreground">disappears
          the moment you delete the original chat</strong>, doesn&rsquo;t preserve
          attachments or the exact time, and can break on its own. A reviewer who
          opens your citation a year later may find nothing there.
        </p>
      </section>

      {/* What the styles say */}
      <section className="mt-12 space-y-4">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 shrink-0 text-bronze" strokeWidth={1.5} />
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            What APA and MLA actually say
          </h2>
        </div>
        <p className="leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">APA 7</strong> treats
          AI output as non-retrievable. Because a reader can&rsquo;t open the same
          conversation, APA recommends you{" "}
          <strong className="font-semibold text-foreground">paste the full
          transcript into an appendix</strong> so it can be seen exactly as it was
          generated, and cite the model as the author (e.g. OpenAI) with the year
          and version.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">MLA 9</strong> notes
          that a unique conversation URL &ldquo;enhances retrievability,&rdquo; but
          gives no guidance on what happens when that link stops working, which is
          precisely the gap you have to close yourself.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          Chicago, Harvard, and IEEE all land in the same place: name the tool,
          give the date, and point to where the exact text can be found. Every one
          of them assumes you have preserved the conversation somewhere durable.
          That preservation step is the part nobody automates, until you make it
          part of your workflow.
        </p>
      </section>

      {/* The reliable method */}
      <section className="mt-12 space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-seal" strokeWidth={1.5} />
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            A method that holds up
          </h2>
        </div>
        <ol className="space-y-4">
          {[
            {
              t: "Capture the exact conversation",
              b: "Use the share link if the tool offers one, or simply copy and paste the full text. Capture it as it was when you used it, before the chat is edited, continued, or deleted.",
            },
            {
              t: "Preserve it somewhere it can't quietly change",
              b: "Save it to a place that records the exact date and time and can't be edited afterwards, by you or anyone else. That immutability is what makes a reviewer trust it.",
            },
            {
              t: "Make it independently verifiable",
              b: "The strongest record is one a reader can confirm without trusting any single website, so it survives even if the original tool, or the archive, goes away.",
            },
            {
              t: "Format the citation in your required style",
              b: "Drop the preserved record into APA, MLA, Chicago, Harvard, IEEE, or BibTeX, with a stable reference a reader can actually follow.",
            },
          ].map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-seal-soft font-serif text-sm font-semibold text-seal">
                {i + 1}
              </span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {s.t}
                </h3>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {s.b}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* How DeCite does it */}
      <section className="mt-12 rounded-xl border border-seal/30 bg-seal-soft/40 p-6 sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Doing all four in one step
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          DeCite was built for exactly this. You paste a conversation (or a share
          link), and it preserves the exact text with a timestamp, gives you a
          short citation code like{" "}
          <span className="font-mono text-bronze">DC-20260619-01</span>, and writes
          a ready-to-paste reference in APA, MLA, Chicago, Harvard, IEEE, and
          BibTeX. No account, currently free.
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          The record is stored across two independent public registries that no
          single company controls, so a reviewer can verify your citation even if
          DeCite itself disappears. It supplements your normal citation, the code
          sits inside an ordinary APA or MLA reference and points to the exact,
          verifiable text.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/muhurle"
            className="group inline-flex items-center justify-center gap-1.5 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-bronze"
          >
            Seal a conversation
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/dogrulama"
            className="inline-flex items-center justify-center rounded-sm border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-bronze"
          >
            Verify a citation code
          </Link>
        </div>
      </section>

      {/* Related */}
      <section className="mt-12">
        <h2 className="eyebrow mb-3 text-bronze">Keep reading</h2>
        <ul className="divide-y divide-border border-y border-border">
          <li>
            <Link
              href="/sss"
              className="flex items-center justify-between gap-4 py-4 text-foreground transition-colors hover:text-bronze"
            >
              <span className="font-serif text-lg">
                Where is the conversation actually stored, and is it permanent?
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </li>
          <li>
            <Link
              href="/son-atiflar"
              className="flex items-center justify-between gap-4 py-4 text-foreground transition-colors hover:text-bronze"
            >
              <span className="font-serif text-lg">
                See real citations people have sealed
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </li>
        </ul>
      </section>
    </article>
  );
}
