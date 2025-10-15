import React from "react";

interface LeaderboardEntry {
    rank: number;
    player: string;
    wins: number;
    losses: number;
    totalBattles: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, player: "0xA12b...34F9", wins: 18, losses: 2, totalBattles: 20 },
    { rank: 2, player: "0xB56c...9F21", wins: 15, losses: 5, totalBattles: 20 },
    { rank: 3, player: "0x9De1...AB76", wins: 11, losses: 9, totalBattles: 20 },
];

const LeaderboardPage: React.FC = () => {
    return (
        <div className="text-white text-center">
            <h2 className="text-4xl font-extrabold mb-10">🏆 Leaderboard</h2>

            {/* Leaderboard Table */}
            <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Player
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Wins
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Losses
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                Total Battles
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {mockLeaderboard.map((entry) => (
                            <tr
                                key={entry.rank}
                                className="hover:bg-gray-700/40 transition"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                    {entry.rank}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-semibold">
                                    {entry.player}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-green-400 font-bold">
                                    {entry.wins}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-red-400">
                                    {entry.losses}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-200">
                                    {entry.totalBattles}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
                <a
                    href="/arena"
                    className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold transition"
                >
                    🔥 Battle Again
                </a>
            </div>
        </div>
    );
};

export default LeaderboardPage;
