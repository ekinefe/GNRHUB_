import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Monitor, ChevronRight } from 'lucide-react';
import CyberButton from '../../../components/ui/CyberButton';
import TextType from '../../../components/animations/TextType';
import BrandBookEditor from './BrandBookEditor';

const BrandBookStart = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        // This will navigate to the actual workspace/editor once you build it
        navigate('/tools/brandbook/workspace');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full relative group">
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyber-cyan to-cyber-pink opacity-10 blur-lg transition duration-1000 group-hover:opacity-30" />

                <div className="relative bg-cyber-black border border-cyber-border p-8 md:p-12 shadow-2xl flex flex-col items-center text-center">

                    {/* Icon */}
                    <div className="w-16 h-16 bg-cyber-panel border border-cyber-cyan flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                        <Palette className="w-8 h-8 text-cyber-cyan" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tighter mb-6 uppercase">
                        <TextType
                            text={["BRANDBOOK_GENERATOR"]}
                            initialDelay={100}
                            typingSpeed={75}
                            pauseDuration={1500}
                            loop={false}
                            showCursor
                            cursorCharacter="_"
                        />
                    </h1>

                    {/* Explanation */}
                    <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed mb-8 max-w-lg">
                        Synthesize your brand identity into a unified, professional PDF style guide. Define your color matrices, typographic hierarchy, and logo constraints in one automated pipeline.
                    </p>

                    {/* Desktop Warning Note */}
                    <div className="w-full flex items-start gap-3 p-4 mb-8 border border-cyber-pink/30 bg-cyber-pink/5 text-left">
                        <Monitor className="w-5 h-5 text-cyber-pink shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-mono text-xs font-bold text-cyber-pink uppercase mb-1">
                                System Recommendation
                            </h4>
                            <p className="font-mono text-xs text-cyber-muted">
                                For optimal canvas rendering, precise color selection, and PDF generation, utilizing a desktop or laptop environment is highly advised.
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <CyberButton
                        variant="primary"
                        icon={ChevronRight}
                        onClick={handleStart}
                        // Connect to the frontend/src/pages/tools/brandbook/BrandBookEditor.jsx
                        className="w-full md:w-auto px-12"
                    >
                        INITIALIZE_WORKSPACE
                    </CyberButton>

                </div>
            </div>
        </div>
    );
};

export default BrandBookStart;