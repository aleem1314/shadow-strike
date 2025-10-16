import React, { useState, useEffect } from "react";
import { getBattleHistory, type BattleRecord } from "../lib/dcaQuery";
import { useWalletStore } from "../store/walletStore";
import { useSnackbar } from "../hooks/useSnackbar";
import { decrypt } from "../lib/fhe";

export interface HistoryRecord {
    opponent: string;
    result: any;
    createdAt: string;
    decrypted: boolean;
}


function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);

    const YYYY = date.getFullYear().toString();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const DD = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');

    return `${YYYY}-${MM}-${DD} ${hh}:${mm}`;
}

const FightHistory: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);

    const { showSnackbar } = useSnackbar();

    const wallet = useWalletStore();
    const [records, setRecords] = useState<HistoryRecord[] | undefined>();

    const [decryptLoading, setDecryptLoading] = useState(false);
    const [decryptIndex, setDecryptIndex] = useState<number>(-1);

    const onDecrypt = async (cyphertext: string, i: number) => {
        setDecryptIndex(i);
        setDecryptLoading(true);
        try {
            const result = await decrypt(
                [cyphertext]
            );

            const decryptedValue = result[cyphertext]; // this is 0, 1, or 2

            setRecords((prevRecords) => {
                if (!prevRecords) return prevRecords;
                const updated = [...prevRecords];
                updated[i] = {
                    ...updated[i],
                    opponent: updated[i].opponent,
                    result: decryptedValue,
                    decrypted: true,
                };
                return updated;
            });

            console.log(result[cyphertext]);
        } catch (err: any) {
            showSnackbar(err.message || JSON.stringify(err), "error");
        } finally {
            setDecryptIndex(-1);
            setDecryptLoading(false);
        }
    }

    useEffect(() => {
        if (wallet.account) {
            setLoading(true);
            getBattleHistory(wallet.account)
                .then((records: BattleRecord[]) => {
                    let tableItems: HistoryRecord[] = [];
                    for (let index = 0; index < records.length; index++) {
                        const element = records[index];
                        tableItems.push({
                            decrypted: false,
                            createdAt: element.createdAt,
                            opponent: element.opponent,
                            result: element.result
                        })
                    }
                    setRecords(tableItems);
                })
                .catch((err: any) => {
                    showSnackbar(err.message || err);
                })
                .finally(() => {
                    setLoading(false);
                })
        }
    }, [wallet]);

    return (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">⚔️ Fight History</h2>
            </div>

            {loading ? (
                <p className="text-gray-400 text-center">Loading fights...</p>
            ) : records?.length === 0 ? (
                <p className="text-gray-400 text-center">No fights recorded yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">#</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Opponent</th>
                                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-300">Result</th>
                                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-300">Date</th>
                                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-300">Decrypt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {
                                !records ?
                                    <></>
                                    :
                                    records.map((fight, index) => (
                                        <tr key={index} className="hover:bg-gray-700/40 transition">
                                            <td className="px-4 py-2 text-gray-100">{index + 1}</td>
                                            <td className="px-4 py-2 text-purple-400 font-semibold">{fight.opponent}</td>
                                            <td className="px-4 py-2 text-center font-bold">
                                                {fight.result === "0" || fight.result === 0n ? (
                                                    <span className="px-3 py-1 rounded-full bg-red-200 text-red-700 text-sm font-semibold">
                                                        ❌ Lost
                                                    </span>
                                                ) : fight.result === "1" || fight.result === 1n ? (
                                                    <span className="px-3 py-1 rounded-full bg-green-200 text-green-700 text-sm font-semibold">
                                                        ✅ Won
                                                    </span>
                                                ) : fight.result === "2" || fight.result === 2n ? (
                                                    <span className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-700 text-sm font-semibold">
                                                        🤝 Draw
                                                    </span>
                                                ) : (
                                                    // If still ciphertext or not yet decrypted
                                                    <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-mono">
                                                        {String(fight.result).slice(0, 18)}...
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-2 text-center text-gray-200">{formatTimestamp(parseInt(fight.createdAt) || 0)}</td>

                                            <td className="px-4 py-2 text-center text-gray-200">
                                                <button
                                                    onClick={() => {
                                                        onDecrypt(fight.result, index)
                                                    }}
                                                    disabled={fight.decrypted}
                                                    className={`px-3 py-2 rounded-lg transition hover:cursor-pointer ${decryptLoading
                                                        ? "bg-yellow-500 text-black hover:bg-yellow-600"
                                                        : "bg-green-600 text-white hover:bg-green-800"
                                                        }`}
                                                >
                                                    {
                                                        decryptLoading && decryptIndex === index ?
                                                            `Decrypting...`
                                                            :
                                                            `Decrypt`
                                                    }
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FightHistory;
