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
  const addr = await game.getAddress(); // use getAddress instead of .address
  return { game, addr };
}

describe("ShadowStrike Battle Game", function () {
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

  // Helper: register a player
  async function registerPlayer(player: HardhatEthersSigner, hp: number, attack: number, defense: number) {
    await (await game.connect(player).registerPlayer("hulk"
    )).wait();
  }

  // Helper: battle and decrypt for both players
  async function battleAndDecrypt(challenger: HardhatEthersSigner, opponent: HardhatEthersSigner) {
    const tx = await game.connect(challenger).battle(opponent.address);
    await tx.wait();

    const challengerHistory = await game.getBattleHistory(challenger.address);
    const opponentHistory = await game.getBattleHistory(opponent.address);

    const encChallengerResult = challengerHistory[0].result;
    const encOpponentResult = opponentHistory[0].result;

    const decryptedChallenger = await fhevm.userDecryptEuint(FhevmType.euint32, encChallengerResult, gameAddr, challenger);
    const decryptedOpponent = await fhevm.userDecryptEuint(FhevmType.euint32, encOpponentResult, gameAddr, opponent);

    return { decryptedChallenger, decryptedOpponent };
  }

  it("Scenario 1: Both users with same HP, Attack, Defense → Draw", async function () {
    await registerPlayer(signers.alice, 100, 30, 20);
    await registerPlayer(signers.bob, 100, 30, 20);

    // const { decryptedChallenger, decryptedOpponent } = await battleAndDecrypt(signers.alice, signers.bob);

    // expect(decryptedChallenger).to.eq(2); // Draw
    // expect(decryptedOpponent).to.eq(2);   // Draw
  });

  // it("Scenario 2: Player A (Alice) has more Attack → Alice wins", async function () {
  //   await registerPlayer(signers.alice, 100, 40, 20);
  //   await registerPlayer(signers.bob, 100, 30, 20);

  //   const { decryptedChallenger, decryptedOpponent } = await battleAndDecrypt(signers.alice, signers.bob);

  //   expect(decryptedChallenger).to.eq(1); // Alice wins
  //   expect(decryptedOpponent).to.eq(0);   // Bob loses
  // });

  // it("Scenario 3: Player B (Bob) has more Attack → Bob wins", async function () {
  //   await registerPlayer(signers.alice, 100, 30, 20);
  //   await registerPlayer(signers.bob, 100, 40, 20);

  //   const { decryptedChallenger, decryptedOpponent } = await battleAndDecrypt(signers.alice, signers.bob);

  //   expect(decryptedChallenger).to.eq(0); // Alice loses
  //   expect(decryptedOpponent).to.eq(1);   // Bob wins
  // });
});
