import React, { useEffect, useState } from "react";
import { useWalletStore } from "../store/walletStore";
import { useSnackbar } from "../hooks/useSnackbar";
import { getPlayer, getPlayers, type Player } from "../lib/query";
import { battle } from "../lib/tx";
import { decrypt } from "../lib/fhe";

const BattleArenaPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const { showSnackbar } = useSnackbar();

    const wallet = useWalletStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [players, setPlayers] = useState<Player[]>([]);

    const [challenger, setChallenger] = useState<Player | undefined>();

    const [battleId, setBattleId] = useState<number | null>(null);
    const [encResult, setEncResult] = useState<string | null>(null);
    const [battleResult, setBattleResult] = useState<number | null>(null);
    const [decrypting, setDecrypting] = useState(false);

    useEffect(() => {
        if (wallet.account) {
            setLoading(true);
            getPlayer(wallet.account)
                .then((player: Player) => {
                    setChallenger({
                        name: player.name,
                        attack: player.attack,
                        defense: player.defense,
                        hp: player.hp,
                        registered: player.registered,
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
                    const otherPlayers = players.filter(player => player.address.toLowerCase() !== wallet?.account!!.toLowerCase());
                    setPlayers(otherPlayers);
                })
                .catch((err: any) => {
                    showSnackbar(err.message || err, "error");
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
        });
        setBattleId(null);
        setEncResult(null);
        setBattleResult(null);
    }

    const reset = async () => {
        setMode("choose");
        setOpponent(undefined);
        setBattleId(null);
        setEncResult(null);
        setBattleResult(null);
    }

    const [battleLoading, setBattleLoading] = useState(false);
    const onClickBattle = async () => {
        if (!opponent?.address) return;
        setBattleLoading(true);
        try {
            const result = await battle(opponent.address);
            setBattleId(result.battleID ? parseInt(result.battleID) : 0);
            setEncResult(result.encResult || "");
            showSnackbar("transaction broadcasted", "tx-success", result.hash);

        } catch (err: any) {
            showSnackbar(err.message || err, "error");
        } finally {
            setBattleLoading(false);
        }
    }


    const onDecryptResult = async () => {
        if (!battleId || !encResult) return;
        setDecrypting(true);
        try {
            const result = await decrypt([encResult]);
            setBattleResult(Number(result[encResult])); // 0 = loss, 1 = win, 2 = draw
        } catch (err: any) {
            showSnackbar(err.message || err, "error");
        } finally {
            setDecrypting(false);
        }
    };

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
                                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg hover:cursor-pointer"
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


                        {/* Result + Actions */}
                        <div className="mt-10">
                            {
                                encResult
                                    ?
                                    battleResult === null ?

                                        <div className="space-x-6">
                                            <button
                                                className={`px-6 py-3 rounded-lg transition hover:cursor-pointer ${decrypting
                                                    ? "bg-yellow-500 text-black hover:bg-yellow-600"
                                                    : "bg-green-600 text-white hover:bg-green-800"
                                                    }`}
                                                onClick={onDecryptResult}
                                                disabled={decrypting}
                                            >
                                                {
                                                    decrypting ? `Please wait...` : `Decrypt Result`
                                                }
                                            </button>
                                        </div>
                                        :
                                        <div className="space-x-6 mb-6">
                                            <button
                                                className={`px-6 py-3 rounded-lg transition hover:cursor-pointer bg-green-600 text-white hover:bg-green-800`}
                                                onClick={reset}
                                            >
                                                Play Again
                                            </button>
                                        </div>
                                    :

                                    <div className="space-x-6">
                                        <button
                                            className={`px-6 py-3 rounded-lg transition hover:cursor-pointer ${battleLoading
                                                ? "bg-yellow-500 text-black hover:bg-yellow-600"
                                                : "bg-green-600 text-white hover:bg-green-800"
                                                }`}
                                            onClick={onClickBattle}
                                            disabled={battleLoading}
                                        >
                                            {
                                                battleLoading ? `Please wait...` : `⚔️ Battle`
                                            }
                                        </button>
                                    </div>
                            }

                            {battleResult !== null && (
                                <div className="text-3xl font-bold text-green-500">
                                    {battleResult === 0 && "❌ You Lost!"}
                                    {battleResult === 1 && "✅ You Won!"}
                                    {battleResult === 2 && "🤝 Draw!"}
                                </div>
                            )}
                        </div>
                    </div>

            }
        </>
    );
};

export default BattleArenaPage;
