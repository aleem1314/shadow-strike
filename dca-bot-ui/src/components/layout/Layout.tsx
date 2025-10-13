import { useEffect } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
    title?: string;
    children: React.ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {

    useEffect(() => {
        document.title = title ? `${title} | Shadow Strike` : 'Shadow Strike';
    }, [title]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">

            {/* Main content wrapper */}
            <div className="flex flex-col flex-1 min-h-screen">
                {/* Navbar */}
                <Navbar
                />

                {/* Main content with left padding on md+ to offset sidebar */}
                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
