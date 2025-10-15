import React from "react";

const HowItWorks: React.FC = () => {

    return (
        <div className="flex flex-col items-center justify-center text-center py-32 bg-gray-900 text-white">
            {/* Section Header */}
            <h2 className="text-5xl font-bold mb-4">How Shadow Strike Works</h2>
            <p className="text-gray-400 max-w-3xl mb-8">
                Shadow Strike uses Fully Homomorphic Encryption (FHE) to keep your battle stats completely private.
                Every player’s HP, attack, and defense are encrypted - even the contract cannot see them.
                Battles are computed on encrypted data, producing a winner without revealing individual stats.
            </p>

            {/* Step-by-step explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">1. Register Your Player</h3>
                    <p className="text-gray-400">
                        Choose a character name and register. Your stats (HP, Attack, Defense) are randomly generated and encrypted.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">2. Battle Opponents</h3>
                    <p className="text-gray-400">
                        Select an opponent and start a battle. The FHE contract calculates the outcome without ever decrypting your stats.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">3. See the Result</h3>
                    <p className="text-gray-400">
                        After the battle, you and your opponent can decrypt the result to see who won. Your stats remain secret.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default HowItWorks;
