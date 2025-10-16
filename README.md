# Shadow Strike

**Shadow Strike** is a privacy-first on-chain battle game that uses **Fully Homomorphic Encryption (FHE)** on Zama’s FHEVM. Players register a character name and receive randomly-generated encrypted stats (HP, Attack, Defense). Battles are computed entirely on encrypted data, so player stats never leave ciphertext — only battle outcomes (as encrypted handles) are produced and selectively authorized for players to decrypt.

## Table of contents

- What is Shadow Strike?
- High-level flow (how a battle works)
- Project layout & where to look next
- License

## What is Shadow Strike?

Shadow Strike is a turn-based one-round battle game built on FHEVM where:

- Players register with a name; the contract generates random encrypted stats for fairness.
- When two players fight, the contract calculates damage and remaining HP using encrypted arithmetic.
- The contract records an encrypted result for each player (win/lose/draw) and a unique battleId.
- Each result handle is explicitly authorized so the rightful player(s) can decrypt it off-chain (e.g., in tests or the UI).
- The contract emits an event including battleId so clients can reliably map the transaction to the stored encrypted result.

The goal: let players compete on chain while keeping sensitive game state private.



## High-level flow (how a battle works)

### 1. Registration
- Players register with a name.
- The contract generates random stats (HP, Attack, Defense) in encrypted form.
- Stats are stored on-chain, keeping them private.

### 2. Challenge & Battle
- One player challenges another.
- The contract computes damage and determines the winner using encrypted calculations.
- The battle result is stored as an encrypted handle and a unique `battleId` is assigned.
- Only the involved players are allowed to decrypt their results.

## 3. Client-side decryption
- After the battle, the frontend listens for the battle event and fetches the result handle.
- Each player can decrypt their own result locally to see if they won, lost, or drew.

Key idea: All calculations and stats stay private; only each player sees their own outcome.

## Project layout & where to look next

- `contracts/Readme.md` - **(Contracts README)** Contains detailed instructions for:
    - Building, testing, and deploying smart contracts
    - FHEVM / Hardhat config notes
- `app/Readme.md` - **(Frontend README)** Contains:
    - How to run the frontend app
    - How to connect to Sepolia testnet

You can jump directly to those docs:
- Contracts: contracts/Readme.md
- Frontend app: app/Readme.md

## License

MIT — see LICENSE in this repository.