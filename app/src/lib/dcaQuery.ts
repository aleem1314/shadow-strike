

import { ethers } from "ethers";
import { ABI, contractAddress } from "./dcaTx";
import type { ShadowStrike } from "./ShadowStrike";
import { decrypt } from "./fhe";

export interface Player {
    attack: string
    defense: string
    hp: string
    registered: boolean
    name: string
    address: string
}

export async function getPlayer(address: string): Promise<Player> {
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

    const contract = new ethers.Contract(
        contractAddress,
        ABI,
        provider
    ) as unknown as ShadowStrike;

    try {
        const player: any = await contract.getPlayer(address);
        return player as unknown as Player;
    } catch (err) {
        throw err;
    }
}

export async function getPlayers(): Promise<Player[]> {
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

    const contract = new ethers.Contract(
        contractAddress,
        ABI,
        provider
    ) as unknown as ShadowStrike;

    try {
        const players: Player[] = [];
        const playersAddress: string[] = await contract.getAllPlayers();

        for (const addr of playersAddress) {
            const player = await contract.getPlayer(addr);

            const playerData: Player = {
                attack: player.attack,
                defense: player.defense,
                hp: player.hp,
                registered: player.registered,
                name: player.name,
                address: addr,
            };

            players.push(playerData);
        }

        console.log("First Player:", players[0]);
        return players;
    } catch (err) {
        console.error("Error fetching players:", err);
        throw err;
    }
}

export interface BattleRecord {
    opponent: string;
    result: string;
    createdAt: string
}

export async function getBattleHistory(address: string): Promise<BattleRecord[]> {

    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

    const contract = new ethers.Contract(
        contractAddress,
        ABI,
        provider
    ) as unknown as ShadowStrike;


    try {
        const result: any = contract.getBattleHistory(address);
        return result as unknown as BattleRecord[];
    } catch (err) {
        console.log(err);
        throw err;
    }
}


export async function testing(): Promise<string> {

    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

    const contract = new ethers.Contract(
        contractAddress,
        ABI,
        provider
    ) as unknown as ShadowStrike;


    try {
        const result: any = await contract.testing();
        console.log(result);

        const dec = await decrypt([result]);
        console.log(dec);
        return result as unknown as string;
    } catch (err) {
        console.log(err);
        throw err;
    }
}
