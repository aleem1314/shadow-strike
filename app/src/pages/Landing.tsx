import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useWalletStore } from "../store/walletStore";
import { getPlayer, type Player } from "../lib/dcaQuery";
import { useSnackbar } from "../hooks/useSnackbar";

const Landing: React.FC = () => {

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const wallet = useWalletStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player | undefined>();

  useEffect(() => {
    if (wallet.account) {
      setLoading(true);
      getPlayer(wallet.account)
        .then((player: Player) => {
          setPlayer(player);
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
    <div>

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center text-center py-32">
        <h2 className="text-5xl font-bold mb-4">Fight Without Revealing Your Strategy</h2>
        <p className="text-gray-400 max-w-2xl mb-8">
          All battles are computed on encrypted data using Fully Homomorphic Encryption (FHE).
          Your stats stay private - but the winner is always clear.
        </p>
        <div className="space-x-4">
          {
            player?.registered ?

              <button
                onClick={() => {
                  navigate("/battle-arena")
                }}
                className={`px-6 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-700 hover:cursor-pointer`}

              >
                New Battle
              </button>

              :
              <button
                onClick={() => {
                  navigate("/register")
                }}
                className={`px-6 py-3 rounded-lg font-semibold
              ${loading || player?.registered
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 hover:cursor-pointer"}
            `}
                disabled={loading || player?.registered}
                title={player?.registered ? "Character is already registered" : ""}

              >
                Register Player
              </button>
          }
          <button
            onClick={() => {
              navigate("/how-works")
            }}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold hover:cursor-pointer"
          >
            How It Works
          </button>
        </div>
      </main >
    </div >
  );
};

export default Landing;
