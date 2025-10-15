import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { ShadowStrike, ShadowStrike__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ShadowStrike")) as ShadowStrike__factory;
  const game = (await factory.deploy()) as ShadowStrike;
  const addr = await game.getAddress();
  return { game, addr };
}

describe("ShadowStrike Sequential Battles", function () {
  let signers: Signers;
  let game: ShadowStrike;
  let gameAddr: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    ({ game, addr: gameAddr } = await deployFixture());
  });

  // Register a player with a name
  async function registerPlayer(player: HardhatEthersSigner, name: string) {
    await (await game.connect(player).registerPlayer(name)).wait();
  }

  // Battle helper: returns decrypted results for both players
  async function battleAndDecrypt(challenger: HardhatEthersSigner, opponent: HardhatEthersSigner) {
    const tx = await game.connect(challenger).battle(opponent.address);
    const receipt = await tx.wait();

    // Parse BattleResolvedEncrypted event
    const event = receipt.logs
      .map((log: any) => {
        try {
          return game.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed?.name === "BattleResolvedEncrypted");

    if (!event) throw new Error("BattleResolvedEncrypted event not found");

    const battleIdNum = Number(event.args.battleId);

    const challengerHistory = await game.getBattleHistory(challenger.address);
    const opponentHistory = await game.getBattleHistory(opponent.address);

    const challengerRecord = challengerHistory.find((r: any) => Number(r.id) === battleIdNum);
    const opponentRecord = opponentHistory.find((r: any) => Number(r.id) === battleIdNum);

    if (!challengerRecord || !challengerRecord.result) throw new Error("Challenger record not found");
    if (!opponentRecord || !opponentRecord.result) throw new Error("Opponent record not found");

    const decryptedChallenger = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      challengerRecord.result,
      gameAddr,
      challenger
    );
    const decryptedOpponent = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      opponentRecord.result,
      gameAddr,
      opponent
    );

    return { decryptedChallenger, decryptedOpponent };
  }

  it("Two sequential battles: both players can decrypt results", async function () {
    // Register players
    await registerPlayer(signers.alice, "Alice");
    await registerPlayer(signers.bob, "Bob");

    // First fight
    const firstFight = await battleAndDecrypt(signers.alice, signers.bob);
    expect([0, 1, 2]).to.include(Number(firstFight.decryptedChallenger));
    expect([0, 1, 2]).to.include(Number(firstFight.decryptedOpponent));

    // Second fight
    const secondFight = await battleAndDecrypt(signers.alice, signers.bob);
    expect([0, 1, 2]).to.include(Number(secondFight.decryptedChallenger));
    expect([0, 1, 2]).to.include(Number(secondFight.decryptedOpponent));
  });
});
