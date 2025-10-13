import { ethers } from 'ethers';
import contractJson from './ShadowStrike.json';
import type { ShadowStrike } from "./ShadowStrike";

export const contractAddress = import.meta.env.VITE_CONTRACT || "0xf5273695AD7171F73AcFF2C0Acd41675B47ebE1A";
export const ABI = contractJson.abi;

export interface TransactionConfirmation {
    hash: string;
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

export async function battle(planId: number): Promise<TransactionConfirmation> {

    // const contract = await getContract();
    // try {
    //     const tx = await contract.pausePlan(planId);

    //     const receipt = await tx.wait();
    //     console.log("Transaction confirmed:", receipt);
    //     return {
    //         hash: receipt?.hash || ""
    //     }
    // } catch (err) {
    //     console.error("Error sending transaction:", err);
    //     throw err;
    // }

    throw new Error("");
}

