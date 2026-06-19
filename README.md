# Sıfır Düşüş Protocol

**AI Dialogue Blockchain Citation & Verification Platform**

Permanently seal human–AI intellectual collaborations on decentralized storage
(Pinata / IPFS) and notarize them with an immutable timestamp on **Polygon**,
generating human-readable citation codes (e.g. `BC-SD-20260619-01`) for books
and papers.

Built with **Next.js 16 (App Router + Server Actions)**, **TypeScript**,
**Tailwind v4**, **shadcn/ui**, **viem / wagmi / RainbowKit**, and the
**Pinata Web3 SDK**. Deployable to **Vercel**.

---

## Architecture

| Layer | Path | Responsibility |
| --- | --- | --- |
| Manifesto / portals | `app/page.tsx` | Landing + dual CTAs |
| Author Minter | `app/muhurle/page.tsx` | Pin → reserve code → sign → confirm |
| Reader Verification | `app/dogrulama/page.tsx` | Code search |
| Verification record | `app/dogrulama/[code]/page.tsx` | On-chain + IPFS lookup |
| IPFS pipeline (server) | `app/actions/pinata.ts` | Dual-input → JSON → pin |
| Smart contract | `contracts/CitationRegistry.sol` | Immutable registry |
| Contract client | `lib/contract.ts` | ABI + viem public client |
| Wallet config | `lib/wagmi.ts` | RainbowKit + wagmi |
| Citation logic | `lib/citation.ts` | Code grammar + APA formatting |
| Server verifier | `lib/verify.ts` | Chain read + IPFS hydrate |
| i18n | `lib/i18n.tsx` | EN (default) · TR · ES |

### The dual-input pipeline

- **Option A — Official Share Link:** validates `chatgpt.com/share/…` /
  `claude.ai/share/…` URLs, fetches the public HTML, and deep-walks embedded
  JSON to reconstruct an ordered `{ role, text }[]` stream.
- **Option B — Direct Text/Markdown:** parses pasted turns (`User:` /
  `Assistant:` markers, with sensible fallbacks) — no scraping.

Both paths converge on the same canonical payload, which is pinned to IPFS with
the **server-only** `PINATA_JWT`. The action returns the immutable `ipfsCID`.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

### Required environment variables (`.env.local`)

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_POLYGON_RPC_URL` | client | Polygon RPC (Amoy or mainnet). A private Alchemy/Infura URL is recommended. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | client | Deployed `CitationRegistry` address. |
| `NEXT_PUBLIC_CHAIN_ID` | client | `137` mainnet · `80002` Amoy testnet. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | client | Free at cloud.walletconnect.com. |
| `PINATA_JWT` | **server only** | Never prefixed with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_PINATA_GATEWAY` | client | Read gateway hostname. |

> **Security:** `PINATA_JWT` is read only inside `app/actions/pinata.ts`
> (`"use server"`). It is never imported by a client component, so it cannot
> reach the browser bundle. `.env.local` is git-ignored.

---

## Deploying the smart contract

`contracts/CitationRegistry.sol` (Solidity ^0.8.24) is gas-optimized and uses
custom errors. Deploy it to Polygon (Amoy testnet recommended first):

1. Open the file in **Remix**, or use Hardhat/Foundry.
2. Compile with Solidity 0.8.24+.
3. Deploy to your target chain with a funded wallet.
4. Copy the deployed address into `NEXT_PUBLIC_CONTRACT_ADDRESS`.

The contract guarantees that an existing deterministic citation code can **never
be overwritten** — `registerCitation` reverts with `CitationAlreadyExists`.

---

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add every variable from `.env.example` in **Project → Settings → Environment
   Variables** (mark `PINATA_JWT` as a non-public secret).
4. Deploy.

---

## Citation code grammar

```
BC-SD-YYYYMMDD-NN
│  │  │        └ 2-digit daily sequence (collision-checked on-chain)
│  │  └ UTC date of sealing
│  └ Sıfır Düşüş
└ Blockchain Citation
```
