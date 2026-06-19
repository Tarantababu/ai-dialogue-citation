import "server-only";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  publicClient,
  activeChain,
  CONTRACT_ADDRESS,
  CITATION_REGISTRY_ABI,
  isContractConfigured,
} from "@/lib/contract";
import { findAvailableCitationCode } from "@/lib/citation";

/**
 * Server-only custodial signer. The DeCite relayer wallet reserves a
 * deterministic code and notarizes a citation on Polygon, paying the gas.
 * `import "server-only"` guarantees this never bundles into the client.
 */

const RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;

function getRelayer() {
  const raw = process.env.RELAYER_PRIVATE_KEY;
  if (!raw || raw === "0xYOUR_RELAYER_PRIVATE_KEY") {
    throw new Error(
      "The signing service is not configured (RELAYER_PRIVATE_KEY).",
    );
  }
  const key = (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`;
  const account = privateKeyToAccount(key);
  const walletClient = createWalletClient({
    account,
    chain: activeChain,
    transport: http(RPC_URL),
  });
  return { account, walletClient };
}

export interface OnChainSeal {
  code: string;
  txHash: `0x${string}`;
  timestamp: number;
  custodian: `0x${string}`;
  chainId: number;
}

/**
 * Reserve an unused code and register the citation on-chain. Throws on any
 * failure; callers translate to user-facing errors.
 */
export async function sealOnChain(params: {
  sourceRef: string;
  ipfsCID: string;
}): Promise<OnChainSeal> {
  if (!isContractConfigured) {
    throw new Error("The registry contract is not configured.");
  }

  const code = await findAvailableCitationCode(async (candidate) => {
    return (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CITATION_REGISTRY_ABI,
      functionName: "exists",
      args: [candidate],
    })) as boolean;
  });

  const { account, walletClient } = getRelayer();
  const txHash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: CITATION_REGISTRY_ABI,
    functionName: "registerCitation",
    args: [code, params.sourceRef, params.ipfsCID],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") {
    throw new Error("The notarizing transaction reverted on-chain.");
  }
  const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });

  return {
    code,
    txHash,
    timestamp: Number(block.timestamp),
    custodian: account.address,
    chainId: activeChain.id,
  };
}
