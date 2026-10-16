import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
// 1. Fixed: Import the component
import FuzzyText from '@/shared/animations/FuzzyText';
import { tokenColor } from '@/shared/config/tokens';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const Unauthorized = () => {
    useDocumentMeta({ title: 'Access denied', noindex: true });
    return (
        <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center p-4 text-center">
            <div className="p-6 border border-cyber-offline/50 rounded-lg bg-cyber-offline/5 max-w-md w-full">
                <Lock className="w-16 h-16 text-cyber-offline mx-auto mb-4 animate-pulse" />

                {/* 2. Fixed: 'classNamee' typo -> 'className' */}
                <div className="mb-8">
                    {/* 3. Fixed: Removed <h1> tag. FuzzyText renders its own canvas, 
                        so we pass the string directly and use fontSize prop. */}
                    <FuzzyText
                        fontSize="3rem"
                        fontWeight={900}
                        color={tokenColor('text')}
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
                <Link to="/" className="text-cyber-pink hover:text-white underline font-mono text-sm">
                    // ABORT_MISSION (GO HOME)
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;