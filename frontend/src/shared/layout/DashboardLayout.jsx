import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen text-cyber-text selection:bg-cyber-pink selection:text-black">

            {/* 1. The Persistent Header */}
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-toast focus:bg-cyber-pink focus:text-black focus:px-4 focus:py-2 font-mono text-sm">
                Skip to content
            </a>
            <Header />

            {/* 2. The Main Content Area */}
            {/* pt-16 accounts for the fixed header height so content isn't hidden */}
            <main id="main" tabIndex={-1} className="pt-16 min-h-screen focus:outline-none">

                {/* <Outlet /> is where the router renders the current page (Home, Gym, etc.) */}
                <Outlet />

            </main>

            <Footer />

        </div>
    );
};

export default DashboardLayout;