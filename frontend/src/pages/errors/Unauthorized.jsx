import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
// 1. Fixed: Import the component
import FuzzyText from '../../components/animations/FuzzyText';

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center p-4 text-center">
            <div className="p-6 border border-cyber-alert/50 rounded-lg bg-cyber-alert/5 max-w-md w-full">
                <Lock className="w-16 h-16 text-cyber-alert mx-auto mb-4 animate-pulse" />

                {/* 2. Fixed: 'classNamee' typo -> 'className' */}
                <div className="mb-8">
                    {/* 3. Fixed: Removed <h1> tag. FuzzyText renders its own canvas, 
                        so we pass the string directly and use fontSize prop. */}
                    <FuzzyText
                        fontSize="3rem"
                        fontWeight={900}
                        color="#fff"
                        baseIntensity={0.1}
                        hoverIntensity={0.3}
                        enableHover={true}
                    >
                        Access Denied
                    </FuzzyText>
                </div>

                <p className="text-zinc-400 font-mono text-sm mb-6">
                    Clearance Level: INSUFFICIENT<br />
                    You do not have the required permissions to access this restricted area.
                </p>
                <Link to="/" className="text-cyber-primary hover:text-white underline font-mono text-sm">
                    // ABORT_MISSION (GO HOME)
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;