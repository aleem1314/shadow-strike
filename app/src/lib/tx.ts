import { ethers } from 'ethers';
import contractJson from './ShadowStrike.json';
import type { ShadowStrike } from "./ShadowStrike";

export const contractAddress = import.meta.env.VITE_CONTRACT || "0x696Dc917e38C04a57685bF47F695466AabF9DAe4";
export const ABI = contractJson.abi;

export interface TransactionConfirmation {
    hash: string;
    battleID?: string;
    encResult?: string;
}

export async function getProviderAndSigner() {
    if (!window.ethereum) throw new Error("Please install wallet!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);

    if (!accounts.length) {
        // Only prompt if no accounts connected yet
        await provider.send("eth_requestAccounts", []);
    }

    const signer = await provider.getSigner();
    return { provider, signer };
}

export async function getContract(readOnly = false): Promise<ShadowStrike> {
    if (readOnly) {
        const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
        return new ethers.Contract(contractAddress, ABI, provider) as unknown as ShadowStrike;
    }

    const { signer } = await getProviderAndSigner();
    return new ethers.Contract(contractAddress, ABI, signer) as unknown as ShadowStrike;
}


export async function register(name: string): Promise<TransactionConfirmation> {
    const contract = await getContract();

    try {

        const tx = await contract.registerPlayer(name, {
            gasLimit: 500000n,
        });

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        return {
            hash: receipt?.hash || ""
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}

export async function battle(opponent: string): Promise<TransactionConfirmation> {

    const contract = await getContract();
    try {

        const tx = await contract.battle(opponent, {
            gasLimit: 3_500_000n,
        });

        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        // Use the contract interface to parse logs
        const iface = contract.interface;
        const battleEvents = receipt?.logs
            .map((log: any) => {
                try {
                    return iface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .filter((e: any) => e && e.name === "BattleResolvedEncrypted");

        if (!battleEvents) {
            throw new Error("BattleResolvedEncrypted event not found");
        }

        if (battleEvents.length === 0) {
            throw new Error("BattleResolvedEncrypted event not found");
        }

        console.log(battleEvents);

        // Usually only one event per transaction
        const event = battleEvents[0];
        const { battleId, encResult } = event?.args || { battleId: 0, encResult: "" };

        return {
            hash: receipt?.hash || "",
            battleID: battleId.toString(),
            encResult: encResult,
        }
    } catch (err) {
        console.error("Error sending transaction:", err);
        throw err;
    }
}

