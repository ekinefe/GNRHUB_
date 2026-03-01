import React from 'react';
import { Link } from 'react-router-dom';
import FuzzyText from '../../components/animations/FuzzyText';
import { ShieldAlert } from 'lucide-react'; // Icon for visual flair

const NotFound = () => {
    return (
        <div className="min-h-screen bg-cyber-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Grid Effect (Optional) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="relative z-10 text-center space-y-6">

                {/* The Glitchy 404 Title */}
                <div className="mb-8">
                    <FuzzyText
                        fontSize="clamp(6rem, 15vw, 10rem)"
                        fontWeight={900}
                        color="#ff003c"
                        baseIntensity={0.2}
                        hoverIntensity={0.5}
                        enableHover={true}
                    >
                        404
                    </FuzzyText>
                </div>

                {/* Technical Error Message */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-sans text-cyber-primary tracking-widest uppercase">
                        System Failure: Coordinates Unknown
                    </h2>
                    <p className="text-zinc-500 font-mono text-sm">
                        Error Code: ERR_PAGE_NOT_FOUND<br />
                        The requested resource vector could not be located in this sector.
                    </p>
                </div>

                {/* Action Button */}
                <div className="pt-8">
                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 border border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black transition-all duration-300 font-mono uppercase tracking-wider group">
                        <ShieldAlert className="w-4 h-4 group-hover:animate-pulse" />
                        <span>Return to Base</span>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default NotFound;