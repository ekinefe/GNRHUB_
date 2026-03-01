import React from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw } from 'lucide-react';
import FuzzyText from '../../components/animations/FuzzyText';

const ServerError = () => {
    return (
        <div className="min-h-screen bg-cyber-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Scanline Background Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}>
            </div>

            <div className="relative z-10 text-center space-y-8 max-w-2xl">

                {/* Critical Error Icon */}
                <div className="flex justify-center mb-6">
                    <ServerCrash className="w-24 h-24 text-cyber-alert animate-pulse" />
                </div>

                {/* Glitchy 500 Title */}
                <div className="mb-4">
                    <FuzzyText
                        fontSize="clamp(4rem, 10vw, 8rem)"
                        fontWeight={900}
                        color="#ff003c" // Deep Alert Red
                        baseIntensity={0.15}
                        hoverIntensity={0.5}
                        enableHover={true}
                    >
                        500 ERROR
                    </FuzzyText>
                </div>

                {/* Diagnostic Message */}
                <div className="space-y-4 border-l-2 border-cyber-alert pl-6 text-left bg-cyber-alert/5 p-4 rounded-r-lg">
                    <h2 className="text-xl font-sans text-cyber-primary tracking-widest uppercase">
                        CRITICAL SYSTEM FAILURE
                    </h2>
                    <p className="text-zinc-400 font-mono text-sm leading-relaxed">
                        &gt; DIAGNOSTIC REPORT:<br />
                        &gt; The central processing unit encountered an unrecoverable exception.<br />
                        &gt; Connection to the mainframe has been severed.<br />
                        &gt; Recommendation: Immediate manual override (Refresh).
                    </p>
                </div>

                {/* Reboot Button */}
                <div className="pt-8 flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-cyber-alert text-black font-bold hover:bg-white transition-all duration-300 font-mono uppercase tracking-wider cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Initiate Reboot</span>
                    </button>

                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 border border-zinc-700 text-zinc-400 hover:border-cyber-primary hover:text-cyber-primary transition-all duration-300 font-mono uppercase tracking-wider">
                        <span>Safe Mode (Home)</span>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default ServerError;