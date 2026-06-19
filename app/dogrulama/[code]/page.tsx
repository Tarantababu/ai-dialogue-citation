import type { Metadata } from "next";
import { loadVerification } from "@/lib/verify";
import { CONTRACT_ADDRESS, activeChain } from "@/lib/contract";
import { VerificationView, type VerificationViewModel } from "@/components/verification-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Verify ${decodeURIComponent(code)}`,
    description: `Verification record for sealed citation ${decodeURIComponent(code)} on the Sıfır Düşüş Protocol.`,
  };
}

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  const outcome = await loadVerification(decoded);

  let model: VerificationViewModel;

  if (outcome.status === "ok") {
    const { record } = outcome;
    model = {
      status: "ok",
      code: record.code,
      sourceRef: record.citation.sourceRef,
      ipfsCID: record.citation.ipfsCID,
      ipfsUrl: record.ipfsUrl,
      author: record.citation.author,
      timestamp: Number(record.citation.timestamp),
      registryAddress: CONTRACT_ADDRESS,
      chainId: activeChain.id,
      origin: record.payload?.origin ?? null,
      platform: record.payload?.platform ?? null,
      sourceUrl: record.payload?.sourceUrl ?? null,
      messages: record.payload?.messages ?? null,
    };
  } else {
    model = { status: outcome.status, code: decoded };
  }

  return <VerificationView model={model} />;
}
