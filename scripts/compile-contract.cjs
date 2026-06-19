/**
 * Compile contracts/CitationRegistry.sol with solc and emit an artifact
 * (ABI + bytecode) to contracts/artifacts/CitationRegistry.json.
 *
 *   node scripts/compile-contract.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const solc = require("solc");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "contracts", "CitationRegistry.sol");
const OUT_DIR = path.join(ROOT, "contracts", "artifacts");
const OUT_FILE = path.join(OUT_DIR, "CitationRegistry.json");

const source = fs.readFileSync(SOURCE, "utf8");

const input = {
  language: "Solidity",
  sources: { "CitationRegistry.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode.object"] },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let fatal = false;
  for (const err of output.errors) {
    console.error(err.formattedMessage);
    if (err.severity === "error") fatal = true;
  }
  if (fatal) {
    console.error("\n✗ Compilation failed.");
    process.exit(1);
  }
}

const contract = output.contracts["CitationRegistry.sol"].CitationRegistry;
const artifact = {
  contractName: "CitationRegistry",
  abi: contract.abi,
  bytecode: "0x" + contract.evm.bytecode.object,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(artifact, null, 2));

console.log("✓ Compiled CitationRegistry");
console.log("  bytecode size:", (artifact.bytecode.length - 2) / 2, "bytes");
console.log("  artifact:", path.relative(ROOT, OUT_FILE));
