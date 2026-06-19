# DeCite

**AI Dialogue Blockchain Citation & Verification Platform**

Permanently seal human–AI intellectual collaborations on decentralized storage
(Pinata / IPFS) and notarize them with an immutable timestamp on **Polygon**,
generating human-readable citation codes (e.g. `DC-20260619-01`) for books and
papers.

**Wallet-free by design.** Authors never install MetaMask or hold crypto. A
server-managed custodial wallet (the *relayer*) pays gas and notarizes every
citation on the user's behalf — sealing is as simple as paste → click.

Built with **Next.js 16 (App Router + Server Actions)**, **TypeScript**,
**Tailwind v4**, **shadcn/ui**, **viem**, and the **Pinata Web3 SDK**.
Deployable to **Vercel**.

---

## Architecture

| Layer | Path | Responsibility |
| --- | --- | --- |
| Manifesto / portals | `app/page.tsx` | Landing + dual CTAs |
| Author Minter | `app/muhurle/page.tsx` | Wallet-free seal form |
| Custodial orchestrator | `app/actions/seal.ts` | Pin → reserve code → notarize (relayer) |
| IPFS pipeline (server) | `app/actions/pinata.ts` | Dual-input → JSON → pin |
| Reader Verification | `app/dogrulama/page.tsx` | Code search |
| Verification record | `app/dogrulama/[code]/page.tsx` | On-chain + IPFS lookup |
| Smart contract | `contracts/CitationRegistry.sol` | Immutable registry |
| Contract client | `lib/contract.ts` | ABI + viem public client |
| Citation logic | `lib/citation.ts` | Code grammar + APA formatting |
| Server verifier | `lib/verify.ts` | Chain read + IPFS hydrate |
| i18n | `lib/i18n.tsx` | EN (default) · TR · ES |

### The dual-input pipeline

- **Option A — Official Share Link:** validates `chatgpt.com/share/…` /
  `claude.ai/share/…` URLs, fetches the public HTML, and deep-walks embedded
  JSON to reconstruct an ordered `{ role, text }[]` stream.
- **Option B — Direct Text/Markdown:** parses pasted turns — no scraping.

Both converge on one canonical payload pinned to IPFS with the **server-only**
`PINATA_JWT`, then notarized on-chain by the relayer in a single Server Action.

### Custodial signing model

The on-chain `author` field is the **DeCite custodian** (relayer) address. The
**human author's name** is captured off-chain in the IPFS payload and shown on
the verification page. This keeps the UX wallet-free while preserving a complete,
tamper-evident provenance record.

> ⚠️ Every seal spends real gas from the relayer wallet. **Gate the
> `sealAndRegister` action behind authentication + payment + rate-limiting
> before production** (see "What's next"). Without a gate, the endpoint is an
> open faucet that can drain the relayer.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

### Environment variables (`.env.local`)

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_POLYGON_RPC_URL` | client | Polygon RPC (Amoy or mainnet). A private Alchemy/Infura URL is recommended. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | client | Deployed `CitationRegistry` address. |
| `NEXT_PUBLIC_CHAIN_ID` | client | `137` mainnet · `80002` Amoy testnet. |
| `RELAYER_PRIVATE_KEY` | **server only** | Funded wallet that signs + pays gas. Never `NEXT_PUBLIC_`. |
| `PINATA_JWT` | **server only** | Pin authorization. Never `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_PINATA_GATEWAY` | client | Read gateway hostname. |

> **Security:** `RELAYER_PRIVATE_KEY` and `PINATA_JWT` are read only inside
> `"use server"` modules and are never imported by a client component, so they
> cannot reach the browser bundle. `.env.local` is git-ignored.

---

## Deploying the smart contract

`contracts/CitationRegistry.sol` (Solidity ^0.8.24) is gas-optimized and uses
custom errors. Deploy to Polygon (Amoy testnet recommended first):

1. Open the file in **Remix**, or use Hardhat/Foundry.
2. Compile with Solidity 0.8.24+.
3. Deploy with a funded wallet (this can be the same relayer wallet).
4. Copy the deployed address into `NEXT_PUBLIC_CONTRACT_ADDRESS`.

An existing deterministic code can **never** be overwritten —
`registerCitation` reverts with `CitationAlreadyExists`.

---

## Deploy to Vercel

1. Push to GitHub (done: `Tarantababu/ai-dialogue-citation`).
2. Import into Vercel.
3. Add every variable from `.env.example` under **Settings → Environment
   Variables** (mark `RELAYER_PRIVATE_KEY` and `PINATA_JWT` as secrets).
4. Redeploy.

---

## Citation code grammar

```
DC-YYYYMMDD-NN
│  │        └ 2-digit daily sequence (collision-checked on-chain)
│  └ UTC date of sealing
└ DeCite
```

---

## What's next

- **Payment / subscription gate** in front of `sealAndRegister` (Stripe
  Checkout for a per-seal fee or a monthly plan). This is what funds and
  protects the relayer wallet.
- **Auth + rate-limiting** so seals are attributable and abuse-resistant.
- **Relayer balance monitoring** + low-funds alerts.
