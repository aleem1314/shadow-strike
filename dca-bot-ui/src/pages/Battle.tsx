import React from "react";

const BattlePage: React.FC = () => {
    return (
        <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-10">🔥 Battle Begins!</h2>

            {/* Battle Grid */}
            <div className="grid grid-cols-3 gap-6 items-center">
                {/* Player */}
                <div className="text-left">
                    <h3 className="text-xl font-semibold">You</h3>
                    <div className="bg-gray-800 p-4 rounded-lg mt-2">🛡️ HP: ???</div>
                </div>

                {/* VS Symbol */}
                <div className="text-6xl font-bold text-red-500">⚔️</div>

                {/* Opponent */}
                <div className="text-right">
                    <h3 className="text-xl font-semibold">Opponent</h3>
                    <div className="bg-gray-800 p-4 rounded-lg mt-2">🛡️ HP: ???</div>
                </div>
            </div>

            {/* Battle Log */}
            <div className="mt-12 bg-gray-800 rounded-xl p-6 text-left max-h-64 overflow-y-auto space-y-2">
                <p>🗡️ You attacked with a secret power!</p>
                <p>🛡️ Opponent defended!</p>
                <p>💥 Secret damage dealt!</p>
            </div>

            {/* Result + Actions */}
            <div className="mt-8">
                <div className="text-3xl font-bold text-green-500 mb-4">✅ You Won!</div>
                <div className="space-x-4">
                    <a
                        href="/arena"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                        Battle Again
                    </a>
                    <a
                        href="/leaderboard"
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg"
                    >
                        View Leaderboard
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BattlePage;
