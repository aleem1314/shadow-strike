# Shadow Strike (FHEVM + Hardhat)

A Hardhat-based project implementing a simple Onchain battle game using FHEVM.

Shadow Strike is a privacy-first on-chain battle game powered by Zama’s FHEVM, where all battles occur on encrypted data. 
Players fight using hidden stats, revealing only their final outcomes.


## Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

## 📁 Project Structure

```
shadow-strike/contracts/
├── contracts/
│   ├── ShadowStrike.sol           # Smart contract
├── deploy/                        # Deployment scripts
├── test/                          # Hardhat tests
├── hardhat.config.ts              # Hardhat config
└── package.json
```

## ⚙️ Core Features

* **Private Battles:** All computations happen on encrypted data - no one can see player stats or outcomes on-chain.
* **Fair Gameplay:** Battle results are determined securely using FHE-based encrypted arithmetic.
* **Selective Decryption:** Only participating players can decrypt and view their own battle outcomes.
* **On-chain History:** Every battle is stored on-chain, preserving an auditable yet private record.

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.


---

**Built with ❤️ using Zama FHEVM**
