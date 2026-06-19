/**
 * Deploy CitationRegistry to the configured Polygon chain using the relayer
 * wallet, then print the deployed address.
 *
 *   node --env-file=.env.local scripts/deploy-contract.mjs
 *
 * Reads from env: RELAYER_PRIVATE_KEY, NEXT_PUBLIC_POLYGON_RPC_URL,
 * NEXT_PUBLIC_CHAIN_ID. Requires contracts/artifacts/CitationRegistry.json
 * (run scripts/compile-contract.cjs first) and a funded relayer wallet.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWalletClient, createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const artifact = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "contracts", "artifacts", "CitationRegistry.json"),
    "utf8",
  ),
);

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "80002");
const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;
const rawKey = process.env.RELAYER_PRIVATE_KEY;

if (!rawKey || rawKey === "0xYOUR_RELAYER_PRIVATE_KEY") {
  console.error("✗ RELAYER_PRIVATE_KEY is not set.");
  process.exit(1);
}

const chain = chainId === polygon.id ? polygon : polygonAmoy;
const key = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
const account = privateKeyToAccount(key);

const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });

console.log(`Network : ${chain.name} (${chainId})`);
console.log(`Deployer: ${account.address}`);

const balance = await publicClient.getBalance({ address: account.address });
console.log(`Balance : ${formatEther(balance)} ${chain.nativeCurrency.symbol}`);
if (balance === 0n) {
  console.error(
    "\n✗ The relayer wallet has no funds. Fund it, then re-run this script.",
  );
  process.exit(1);
}

console.log("\nDeploying CitationRegistry…");
const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
});
console.log("  tx:", hash);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (receipt.status !== "success" || !receipt.contractAddress) {
  console.error("✗ Deployment failed.");
  process.exit(1);
}

console.log("\n✓ Deployed CitationRegistry");
console.log("  address:", receipt.contractAddress);
console.log("  block  :", receipt.blockNumber.toString());
console.log(`\nSet NEXT_PUBLIC_CONTRACT_ADDRESS="${receipt.contractAddress}"`);
