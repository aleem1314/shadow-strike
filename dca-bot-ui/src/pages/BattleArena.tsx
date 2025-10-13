import React, { useEffect, useState } from "react";
import { useWalletStore } from "../store/walletStore";
import { useSnackbar } from "../hooks/useSnackbar";
import { getPlayer, getPlayers, type Player } from "../lib/dcaQuery";

const BattleArenaPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const { showSnackbar } = useSnackbar();

    const wallet = useWalletStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [players, setPlayers] = useState<Player[]>([]);

      const [challenger, setChallenger] = useState<Player | undefined>();
    
      useEffect(() => {
        if (wallet.account) {
          setLoading(true);
          getPlayer(wallet.account)
            .then((player: Player) => {
              setChallenger({
                ...player,
                address: wallet.account || "-",
              });
            })
            .catch((err: any) => {
              showSnackbar(err.message || err);
            })
            .finally(() => {
              setLoading(false);
            })
        }
      }, [wallet]);

    const [mode, setMode] = useState<"fight" | "choose">("choose");

    useEffect(() => {
        if (wallet.account) {
            setLoading(true);
            getPlayers()
                .then((players: Player[]) => {
                    setPlayers(players);
                })
                .catch((err: any) => {
                    showSnackbar(err.message || err);
                })
                .finally(() => {
                    setLoading(false);
                })
        }
    }, [wallet]);

    const filteredPlayers = players.filter((player) =>
        player.name.toLowerCase().includes(search.toLowerCase()) ||
        (player.address && player.address.toLowerCase().includes(search.toLowerCase()))
    );

    const [opponent, setOpponent] = useState<{ address: string, name: string } | undefined>();
    const onChallenge = async (address: string, name: string) => {
        setMode("fight");
        setOpponent({
            address: address,
            name: name,
        })
    }


    return (
        <>
            {
                mode === "choose" ?
                    <div className="text-white">
                        <h2 className="text-4xl font-bold text-center mb-8">🏟️ Choose Your Opponent</h2>

                        <div className="flex justify-center mb-6">
                            <input
                                type="text"
                                placeholder="Search by address or name"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-1/2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>

                        <div className="space-y-4 max-w-2xl mx-auto">
                            {
                                loading ?
                                    <div>
                                        <p className="text-gray-500 text-center">
                                            Getting players...
                                        </p>
                                    </div>
                                    :
                                    filteredPlayers.length > 0 ? (
                                        filteredPlayers.map((player, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition"
                                            >
                                                <div>
                                                    <h3 className="font-semibold">Player - {player.name}</h3>
                                                    <p className="text-gray-400 text-sm">
                                                        {player.address}
                                                    </p>
                                                </div>
                                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                                                    onClick={() => {
                                                        onChallenge(player.address!!, player.name)
                                                    }}
                                                >
                                                    ⚔️ Challenge
                                                </button>
                                            </div>
                                        ))
                                    ) :
                                        <p className="text-gray-500 text-center">No players found.</p>
                            }

                        </div>
                    </div>
                    :
                    <div className="text-white text-center py-12">
                        <h2 className="text-4xl font-bold mb-10">🔥 Battle Begins!</h2>

                        {/* Battle Grid */}
                        <div className="grid grid-cols-3 gap-8 items-center">
                            {/* Player */}
                            <div className="text-left bg-gray-800 p-6 rounded-2xl shadow-md">
                                <h3 className="text-xl font-semibold mb-2">🧑‍🚀 You</h3>
                                <p className="text-lg font-bold text-green-400">{challenger?.name || "-"}</p>
                                <p className="text-gray-400 text-sm break-all">{challenger?.address || "-"}</p>
                            </div>

                            {/* VS Symbol */}
                            <div className="text-6xl font-bold text-red-500 animate-pulse">⚔️</div>

                            {/* Opponent */}
                            <div className="text-right bg-gray-800 p-6 rounded-2xl shadow-md">
                                <h3 className="text-xl font-semibold mb-2">👹 Opponent</h3>
                                <p className="text-lg font-bold text-red-400">{opponent?.name || "-"}</p>
                                <p className="text-gray-400 text-sm break-all">{opponent?.address || "-"}</p>
                            </div>
                        </div>

                        {/* Battle Log */}
                        <div className="mt-12 bg-gray-900 rounded-xl p-6 text-left max-h-64 overflow-y-auto space-y-3 shadow-inner border border-gray-700">
                            <p>🗡️ You launched a secret attack!</p>
                            <p>🛡️ Opponent countered with encrypted defense!</p>
                            <p>💥 Encrypted damage computed privately!</p>
                            <p>🤖 Smart contract verified encrypted battle result!</p>
                        </div>

                        {/* Result + Actions */}
                        <div className="mt-10">
                            <div className="text-3xl font-bold text-green-500 mb-6">✅ You Won (Privately)!</div>
                            <div className="space-x-6">
                                <a
                                    href="/arena"
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                >
                                    ⚔️ Battle Again
                                </a>
                                <a
                                    href="/leaderboard"
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg transition"
                                >
                                    🏆 View Leaderboard
                                </a>
                            </div>
                        </div>
                    </div>

            }
        </>
    );
};

export default BattleArenaPage;
