import { createPublicClient, http, defineChain, type Chain } from "viem";
import { polygon, polygonAmoy } from "viem/chains";

/**
 * Contract ABI + viem public client.
 * The ABI mirrors contracts/CitationRegistry.sol exactly and is the single
 * source of truth shared by Server Actions, the verification reads, and the
 * wagmi write hooks on the minter panel.
 */

export const CITATION_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerCitation",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_code", type: "string" },
      { name: "_sourceRef", type: "string" },
      { name: "_ipfsCID", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getCitation",
    stateMutability: "view",
    inputs: [{ name: "_code", type: "string" }],
    outputs: [
      { name: "sourceRef", type: "string" },
      { name: "ipfsCID", type: "string" },
      { name: "timestamp", type: "uint256" },
      { name: "author", type: "address" },
      { name: "isRegistered", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "exists",
    stateMutability: "view",
    inputs: [{ name: "_code", type: "string" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "totalCitations",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "CitationRegistered",
    inputs: [
      { name: "code", type: "string", indexed: true },
      { name: "author", type: "address", indexed: true },
      { name: "ipfsCID", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  { type: "error", name: "CitationAlreadyExists", inputs: [{ name: "code", type: "string" }] },
  { type: "error", name: "CitationNotFound", inputs: [{ name: "code", type: "string" }] },
  { type: "error", name: "EmptyField", inputs: [{ name: "field", type: "string" }] },
] as const;

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "80002");
const RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;

/** Resolve the active Polygon chain from the configured chain id. */
export function getActiveChain(): Chain {
  if (CHAIN_ID === polygon.id) return polygon;
  if (CHAIN_ID === polygonAmoy.id) return polygonAmoy;
  // Fallback: a generic Polygon-compatible chain built from env.
  return defineChain({
    id: CHAIN_ID,
    name: `Polygon (${CHAIN_ID})`,
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL ?? ""] } },
  });
}

export const activeChain = getActiveChain();

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

/** Whether a real (non-zero) contract address has been injected. */
export const isContractConfigured =
  CONTRACT_ADDRESS.toLowerCase() !==
  "0x0000000000000000000000000000000000000000";

/** Read-only viem client used for server- and client-side contract reads. */
export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(RPC_URL),
});
