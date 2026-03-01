import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-cyber-black text-cyber-text selection:bg-cyber-pink selection:text-black">

            {/* 1. The Persistent Header */}
            <Header />

            {/* 2. The Main Content Area */}
            {/* pt-16 accounts for the fixed header height so content isn't hidden */}
            <main className="pt-16 min-h-screen">

                {/* <Outlet /> is where the router renders the current page (Home, Gym, etc.) */}
                <Outlet />

            </main>

        </div>
    );
};

export default DashboardLayout;