import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import WalletConnectButton from "./../ui/WalletConnectButton";

export default function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { label: "🔥 New Fight", path: "/battle-arena" },
        { label: "🏆 History", path: "/history" },
        { label: "ℹ️ About", path: "/how-works" },
    ];

    return (
        <header className="bg-gray-900 text-white border-b border-gray-800 px-6 py-4">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <h1
                    className="text-2xl font-bold hover:cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    ⚔️ Shadow Strike
                </h1>

                <div className="flex-grow"></div>

                {/* Desktop Links */}
                <nav className="hidden md:flex items-center space-x-6 mr-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.path}
                            className="px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold hover:cursor-pointer"
                            onClick={() => navigate(link.path)}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>

                {/* Wallet Button */}
                <div className="ml-auto hidden md:block">
                    <WalletConnectButton />
                </div>

                {/* Hamburger for Mobile */}
                <button
                    className="md:hidden ml-4"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? (
                        <XMarkIcon className="h-6 w-6 text-white" />
                    ) : (
                        <Bars3Icon className="h-6 w-6 text-white" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden mt-4 space-y-4 bg-gray-800 rounded-lg p-4">
                    {navLinks.map((link) => (
                        <button
                            key={link.path}
                            className="block w-full text-left hover:text-gray-300 font-semibold"
                            onClick={() => {
                                navigate(link.path);
                                setMenuOpen(false);
                            }}
                        >
                            {link.label}
                        </button>
                    ))}
                    <div className="pt-2 border-t border-gray-700">
                        <WalletConnectButton />
                    </div>
                </div>
            )}
        </header>
    );
}
