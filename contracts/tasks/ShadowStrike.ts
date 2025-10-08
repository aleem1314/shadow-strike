import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { ethers } from "hardhat";

/**
 * Task: Print ShadowStrike contract address
 */
task("task:address", "Prints the ShadowStrike contract address").setAction(async function (_args: TaskArguments, hre) {
  const { deployments } = hre;
  const shadowStrike = await deployments.get("ShadowStrike");
  console.log("ShadowStrike address is " + shadowStrike.address);
});

/**
 * Task: Decrypt a battle result for a given player
 * Usage: npx hardhat --network localhost task:decrypt-result --player <address>
 */
task("task:decrypt-result", "Decrypts the last battle result of a player")
  .addParam("player", "The player's address")
  .addOptionalParam("address", "ShadowStrike contract address")
  .setAction(async function (args: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const contractInfo = args.address ? { address: args.address } : await deployments.get("ShadowStrike");
    const playerAddr = args.player;

    const signers = await ethers.getSigners();
    const playerSigner = signers.find(s => s.address.toLowerCase() === playerAddr.toLowerCase());
    if (!playerSigner) throw new Error(`Player signer not found for ${playerAddr}`);

    const shadowStrike = await ethers.getContractAt("ShadowStrike", contractInfo.address);

    const history = await shadowStrike.getBattleHistory(playerAddr);
    if (history.length === 0) {
      console.log("No battles found for this player.");
      return;
    }

    const lastResult = history[history.length - 1].result;
    const clearResult = await fhevm.userDecryptEuint(FhevmType.euint32, lastResult, contractInfo.address, playerSigner);

    console.log(`Encrypted battle result: ${lastResult}`);
    console.log(`Decrypted battle result: ${clearResult} (0=loss,1=win,2=draw)`);
  });

/**
 * Task: Register a player
 * Usage: npx hardhat --network localhost task:register --hp 100 --attack 30 --defense 20 --player <address>
 */
task("task:register", "Register a new player in ShadowStrike")
  .addParam("player", "The player's address")
  .addParam("hp", "Player HP")
  .addParam("attack", "Player Attack")
  .addParam("defense", "Player Defense")
  .addOptionalParam("address", "ShadowStrike contract address")
  .setAction(async function (args: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();

    const contractInfo = args.address ? { address: args.address } : await deployments.get("ShadowStrike");
    const shadowStrike = await ethers.getContractAt("ShadowStrike", contractInfo.address);

    // Encrypt stats
    const encryptedStats = await fhevm
      .createEncryptedInput(contractInfo.address, args.player)
      .add32(parseInt(args.hp))
      .add32(parseInt(args.attack))
      .add32(parseInt(args.defense))
      .encrypt();

    const tx = await shadowStrike.registerPlayer(
      encryptedStats.handles[0],
      encryptedStats.handles[1],
      encryptedStats.handles[2],
      encryptedStats.inputProof
    );
    console.log(`Register tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Status: ${receipt?.status}`);
  });

/**
 * Task: Battle between two players
 * Usage: npx hardhat --network localhost task:battle --challenger <address> --opponent <address>
 */
task("task:battle", "Perform a battle between two players")
  .addParam("challenger", "Challenger address")
  .addParam("opponent", "Opponent address")
  .addOptionalParam("address", "ShadowStrike contract address")
  .setAction(async function (args: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const contractInfo = args.address ? { address: args.address } : await deployments.get("ShadowStrike");
    const shadowStrike = await ethers.getContractAt("ShadowStrike", contractInfo.address);

    const signers = await ethers.getSigners();
    const challengerSigner = signers.find(s => s.address.toLowerCase() === args.challenger.toLowerCase());
    if (!challengerSigner) throw new Error("Challenger signer not found");

    const tx = await shadowStrike.connect(challengerSigner).battle(args.opponent);
    console.log(`Battle tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Status: ${receipt?.status}`);
  });
