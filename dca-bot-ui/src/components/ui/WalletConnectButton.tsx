import { ethers } from 'ethers';
import { ClipboardIcon, CheckIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useWalletStore } from './../../store/walletStore';

export default function ConnectWalletButton() {
    const { account, ensName, setWallet, resetWallet } = useWalletStore();
    const [copied, setCopied] = useState(false);

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                alert('MetaMask is not installed. Please install it to connect.');
                return;
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const name = await provider.lookupAddress(accounts[0]);

            setWallet(accounts[0], name || null);
        } catch (err) {
            console.error('Wallet connection failed:', err);
        }
    };

    const shortAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const copyAddress = async () => {
        if (account) {
            await navigator.clipboard.writeText(account);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!account) {
        return (
            <button
                onClick={connectWallet}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
            >
                Connect Wallet
            </button>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg flex items-center justify-between gap-4 px-4 py-2 min-w-[220px]">
            <div className="flex flex-col gap-1">
                <span className="text-white text-sm font-semibold">{ensName || 'Ethereum Wallet'}</span>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">{shortAddress(account)}</span>
                    <button
                        onClick={copyAddress}
                        className="p-1 rounded hover:bg-gray-700 transition"
                        title="Copy Address"
                    >
                        {copied ? (
                            <CheckIcon className="h-4 w-4 text-green-400" />
                        ) : (
                            <ClipboardIcon className="h-4 w-4 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>
            <button
                onClick={resetWallet}
                className="p-1 rounded hover:bg-gray-700 transition"
                title="Disconnect"
            >
                <ArrowRightEndOnRectangleIcon className="h-5 w-5 text-red-400 hover:text-red-500" />
            </button>
        </div>
    );
}
