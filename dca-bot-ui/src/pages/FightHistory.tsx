import React, { useState, useEffect } from "react";
import { getBattleHistory, type BattleRecord } from "../lib/dcaQuery";
import { useWalletStore } from "../store/walletStore";
import { useSnackbar } from "../hooks/useSnackbar";
import { decrypt } from "../lib/fhe";

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
    const [records, setRecords] = useState<BattleRecord[] | undefined>();

    const [decryptLoading, setDecryptLoading] = useState(false);
    const onDecrypt = async () => {
        setDecryptLoading(true);
        try {
            const result = await decrypt(
                records?.map(record => String(record.result)) || []
            );
            console.log(result);

        } catch (err: any) {
            showSnackbar(err.message || JSON.stringify(err), "error");
        } finally {
            setDecryptLoading(false);
        }
    }

    useEffect(() => {
        if (wallet.account) {
            setLoading(true);
            getBattleHistory(wallet.account)
                .then((records: BattleRecord[]) => {
                    setRecords(records);
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
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">⚔️ Fight History</h2>
                <button
                    onClick={onDecrypt}
                    disabled={decryptLoading}
                    className={`px-6 py-3 rounded-lg transition hover:cursor-pointer ${decryptLoading
                        ? "bg-yellow-500 text-black hover:bg-yellow-600"
                        : "bg-green-600 text-white hover:bg-green-800"
                        }`}
                >
                    {
                        decryptLoading ? `Decrypting...` : 'Decrypt All'
                    }
                </button>
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
                                            <td className="px-4 py-2 text-gray-100">{index}</td>
                                            <td className="px-4 py-2 text-purple-400 font-semibold">{fight.opponent}</td>
                                            <td
                                                className={`px-4 py-2 text-center font-bold`}
                                            >
                                                {fight.result}
                                            </td>
                                            <td className="px-4 py-2 text-center text-gray-200">{formatTimestamp(parseInt(fight.createdAt) || 0)}</td>

                                            <td>
                                                <button
                                                    className={`px-6 py-3 rounded-lg transition hover:cursor-pointer ${decryptLoading
                                                        ? "bg-yellow-500 text-black hover:bg-yellow-600"
                                                        : "bg-green-600 text-white hover:bg-green-800"
                                                        }`}
                                                >Decrypt</button>
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
