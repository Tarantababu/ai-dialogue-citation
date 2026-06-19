import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { finalizeCheckoutSession } from "@/lib/seal-finalize";
import { SealSuccessView } from "@/components/seal-success-view";
import type { SealRegisterResult } from "@/lib/types";

export const metadata: Metadata = {
  title: "Seal complete",
};

// Always run fresh — this page finalizes an on-chain transaction.
export const dynamic = "force-dynamic";

export default async function SealSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Missing checkout session
        </h1>
        <Link
          href="/muhurle"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-bronze hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the minter
        </Link>
      </div>
    );
  }

  const result: SealRegisterResult = await finalizeCheckoutSession(session_id);
  return <SealSuccessView result={result} />;
}
