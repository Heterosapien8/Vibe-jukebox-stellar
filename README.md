# 🎵 VIBE Jukebox — Token-Curated Jukebox on Stellar & Soroban

[![CI/CD Pipeline](https://github.com/Heterosapien8/aug_stellar/actions/workflows/ci.yml/badge.svg)](https://github.com/Heterosapien8/aug_stellar/actions/workflows/ci.yml)
[![Stellar Network](https://img.shields.io/badge/Stellar-Testnet-00f0ff.svg?logo=stellar)](https://stellar.org)
[![Soroban Smart Contracts](https://img.shields.io/badge/Soroban-Rust_WASM-ff007f.svg)](https://soroban.stellar.org)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black.svg?logo=next.js)](https://nextjs.org)

**Rise In — Stellar Bootcamp Bounty Submission**  
Built by **Heterosapien8** (`kumardivyanshu8888@gmail.com`)

---

## 🌟 Overview

**VIBE Jukebox** is a decentralized, token-curated music lounge application deployed on the **Stellar Testnet** and powered by **Soroban smart contracts**.

Users connect their Stellar wallet, claim free daily **VIBE testnet tokens**, tip the jukebox node in **native XLM**, and spend variable amounts of VIBE to upvote and re-rank songs in a live shared music queue. Spent tokens are automatically burned on-chain via inter-contract calls.

---

## 🥋 Belt Milestones Satisfied

### 🥋 Level 1 (White Belt)
- [x] **Freighter Wallet Integration**: Connect & disconnect handling with real-time public key discovery.
- [x] **Live Horizon Balance Fetching**: Queries native XLM balance from Stellar Horizon Testnet (`https://horizon-testnet.stellar.org`).
- [x] **"Tip the Jukebox" XLM Payment Flow**:
  - Builds Stellar transaction XDR using `TransactionBuilder` and `Operation.payment`.
  - Signs with connected wallet (Freighter / WalletsKit / Demo keypair).
  - Submits to Stellar Horizon Testnet.
  - Real-time transaction feedback with instant direct links to **Stellar Expert Explorer**.
- [x] **Cyber-Neon Dark Glassmorphism UI**: High-end interactive interface with audio spectrum visualizers and sound effects.
- [x] **10+ Granular Meaningful Git Commits**: Dedicated commit history mapping each milestone.

### 🥋 Level 2 (Yellow Belt)
- [x] **StellarWalletsKit Multi-Wallet Support**: Support for Freighter, Albedo, xBull, and LOBSTR.
- [x] **3+ Distinct Error Types Handled**:
  1. *Wallet Not Found / Extension Missing* (shows direct installation guides and sandbox option).
  2. *Signature Request Rejected* (user cancellation handled gracefully without app crash).
  3. *Insufficient Balance / Unfunded Account* (friendbot 1-click testnet faucet integration).
- [x] **Deployed Soroban Contracts**:
  - `vibe-token`: Token contract with 24-hour rate-limited `claim_daily`, `burn`, `mint`, and `transfer`.
  - `jukebox-voting`: Voting contract with `add_song`, variable `vote` burning tokens, and `soft_reset`.
- [x] **Frontend Contract Invocation**: Real-time simulation and state synchronization for queue re-ordering and token burning.

### 🥋 Level 3 (Black Belt)
- [x] **Inter-Contract Communication**: `jukebox-voting` contract invokes `vibe-token::burn(voter, amount)` during song voting.
- [x] **Daily Soft-Reset Logic**: Standings automatically clear when rolling out of an active voting day, leaving songs untouched.
- [x] **Full Rust Unit Test Suite**: Comprehensive `#[test]` coverage for all contract functions, error cases, and daily rollover.
- [x] **Frontend Vitest Suite**: Unit & integration tests for Stellar SDK helpers, contract state machines, and React UI components.
- [x] **CI/CD Pipeline**: GitHub Actions workflow (`.github/workflows/ci.yml`) automating contract testing, frontend testing, and production builds.
- [x] **Mobile Responsive Design & Web Audio API**: Live equalizer animations and synthesized sound effects.

---

## 🏛️ Project Architecture

```
aug_stellar/
├── contracts/
│   ├── vibe-token/              # Soroban Rust Contract: VIBE Token
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs           # Token contract logic (claim_daily, burn, mint)
│   │       └── test.rs          # Rust unit tests
│   └── jukebox-voting/          # Soroban Rust Contract: Jukebox Voting
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs           # Inter-contract burn calls, soft reset, queue
│           └── test.rs          # Inter-contract unit tests
├── frontend/                    # Next.js 14 (App Router) + TypeScript
│   ├── src/
│   │   ├── app/                 # Root layout, globals.css, main jukebox page
│   │   ├── components/          # UI components (Navbar, TipModal, SongQueue, AudioVisualizer, Toast)
│   │   ├── lib/                 # Stellar SDK, Horizon client, WalletsKit, Web Audio SFX
│   │   ├── types/               # TypeScript interfaces
│   │   └── __tests__/           # Vitest & React Testing Library test suite
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vitest.config.ts
├── .github/workflows/ci.yml     # Automated CI/CD build & test pipeline
├── Cargo.toml                   # Root Cargo workspace
├── PROJECT.md                   # Architecture & design specifications
├── REQUIREMENTS.md              # Live checklist tracker
└── README.md                    # This documentation file
```

---

## 📦 Stellar Testnet Details

| Parameter | Value |
|---|---|
| **Network** | Stellar Testnet |
| **Horizon RPC** | `https://horizon-testnet.stellar.org` |
| **Soroban RPC** | `https://soroban-testnet.stellar.org` |
| **Network Passphrase** | `Test SDF Network ; September 2015` |
| **Jukebox Treasury Address** | `GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR` |
| **VIBE Token Contract ID** | `CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM` |
| **Jukebox Voting Contract ID** | `CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBD3LN` |
| **Explorer** | [Stellar Expert Testnet](https://stellar.expert/explorer/testnet) |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org) (v18+ or v20+)
- [Rust & Cargo](https://rustup.rs) (with `wasm32-unknown-unknown` target)
- [Freighter Wallet Extension](https://freighter.app) (optional: built-in demo sandbox included)

### 1. Clone & Setup
```bash
git clone https://github.com/Heterosapien8/aug_stellar.git
cd aug_stellar
```

### 2. Test Smart Contracts (Rust)
```bash
cargo test
```
*Runs all unit tests for token minting, rate-limited daily claims, inter-contract burns, and daily soft resets.*

### 3. Run Frontend Tests
```bash
cd frontend
npm install --legacy-peer-deps
npm test
```

### 4. Start Local Development Server
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Verification

### Smart Contracts (Rust)
```
running 3 tests in vibe-token:
test test::test_initialize_and_metadata ... ok
test test::test_daily_claim_workflow ... ok
test test::test_burn_and_transfer ... ok

running 2 tests in jukebox-voting:
test test::test_daily_soft_reset ... ok
test test::test_jukebox_flow_and_inter_contract_voting ... ok

test result: ok. 5 passed; 0 failed
```

### Frontend (Vitest)
```
 ✓ src/__tests__/contract.test.ts (4 tests)
 ✓ src/__tests__/stellar.test.ts (3 tests)
 ✓ src/__tests__/components.test.tsx (2 tests)

Test Files  3 passed (3)
Tests       9 passed (9)
```

---

## 📜 License
MIT License. Built for the Rise In Stellar Bootcamp Bounty.
