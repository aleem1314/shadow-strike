import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBattleHistory, type BattleRecord } from "../lib/dcaQuery";
import { useWalletStore } from "../store/walletStore";
import { useSnackbar } from "../hooks/useSnackbar";

const FightHistory: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const { showSnackbar } = useSnackbar();

    const wallet = useWalletStore();
    const [records, setRecords] = useState<BattleRecord[] | undefined>();

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
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">⚔️ Fight History</h2>
                <button
                    onClick={() => navigate("/arena")}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                >
                    🔥 Start New Fight
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
                                            <td className="px-4 py-2 text-center text-gray-200">{new Date().toISOString()}</td>
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
