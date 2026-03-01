import React, { useState, useEffect } from 'react';
import { Settings, Download, ArrowLeft, Palette, Type, Image as ImageIcon, Layout, Users, Mic, Share2, X, Upload, Printer, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CyberButton from '../../../components/ui/CyberButton';

// Pre-defined font matrix WITH licenses added
const FONTS = [
    { name: 'JetBrains Mono', type: 'Monospace', license: 'OFL', tags: ['Coding', 'Retro', 'Hipster'] },
    { name: 'Inter', type: 'Sans Serif', license: 'OFL', tags: ['Modern', 'Clean', 'UI Friendly'] },
    { name: 'Playfair Display', type: 'Serif', license: 'OFL', tags: ['Elegant', 'Classic', 'Luxury'] },
    { name: 'Roboto', type: 'Sans Serif', license: 'Apache', tags: ['Professional', 'Tech'] },
    { name: 'Merriweather', type: 'Serif', license: 'OFL', tags: ['Readable', 'Editorial', 'Traditional'] },
    { name: 'Montserrat', type: 'Sans Serif', license: 'OFL', tags: ['Geometric', 'Urban', 'Bold'] },
    { name: 'Oswald', type: 'Sans Serif (Condensed)', license: 'OFL', tags: ['Condensed', 'Impactful', 'Digital'] }
];

const BrandBookEditor = () => {
    // --- STATE MANAGEMENT ---
    const [config, setConfig] = useState({
        name: 'CYBER_DYNAMICS',
        slogan: 'Architecting the digital frontier.',
        primaryLogo: null,
        secondaryLogo: null,
        icon: null,
        primary: '#FF318C',
        secondary: '#00E5FF',
        background: '#FFFFFF',
        text: '#111111',
        secondaryText: '#666666',
        borderRadius: '0px',
        typography: 'Inter',
        mission: 'To democratize access to high-performance computing paradigms.',
        vision: 'A universally connected matrix of decentralized intelligence.',
        voiceKeywords: 'Authoritative, Futuristic, Direct',
        voiceDescription: 'We speak with precision and clarity. No fluff, just pure data-driven confidence.',
        email: 'hello@cyberdynamics.io',
        website: 'www.cyberdynamics.io',
        phone: '+1 (555) 019-8372',
        address: '128 Neo-Tokyo Grid, Sector 7'
    });

    const [team, setTeam] = useState([{
        id: 1,
        name: 'Jane Doe',
        role: 'Lead Architect',
        photo: null,
        story: 'Pioneer of decentralized systems.',
        bio: 'Jane brings over a decade of experience in building scalable, fault-tolerant architectures. She previously led engineering at top-tier tech firms.',
        contact: 'jane@cyberdynamics.io',
        link1: 'linkedin.com/in/janedoe',
        link2: 'github.com/janedoe'
    }]);

    const [socials, setSocials] = useState([
        { id: 1, platform: 'X (Twitter)', url: '@cyberdynamics' },
        { id: 2, platform: 'LinkedIn', url: 'linkedin.com/company/cyberdynamics' }
    ]);

    // NEW: Print Warning Modal State
    const [showPrintWarning, setShowPrintWarning] = useState(false);

    // --- HELPER TO GET ACTIVE FONT DATA ---
    const activeFont = FONTS.find(f => f.name === config.typography) || FONTS[1];

    // --- DYNAMIC FONT INJECTION ---
    useEffect(() => {
        const fontName = config.typography.replace(/ /g, '+');
        const linkId = `dynamic-font-${fontName}`;
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600;700;italic&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, [config.typography]);

    // --- HANDLERS ---
    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleDynamicChange = (setter, id, field, value) => {
        setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = (setter, defaultObj) => setter(prev => [...prev, { id: Date.now(), ...defaultObj }]);
    const removeItem = (setter, id) => setter(prev => prev.filter(item => item.id !== id));

    const handleLogoUpload = (e, logoType) => {
        const file = e.target.files[0];
        if (file) setConfig(prev => ({ ...prev, [logoType]: URL.createObjectURL(file) }));
    };

    const handleTeamPhoto = (id, e) => {
        const file = e.target.files[0];
        if (file) handleDynamicChange(setTeam, id, 'photo', URL.createObjectURL(file));
    };

    // Print Interception Logic
    const triggerPrintWarning = () => {
        setShowPrintWarning(true);
    };

    const executePrint = () => {
        setShowPrintWarning(false);
        // Small timeout ensures the modal is fully removed from the DOM before printing
        setTimeout(() => {
            window.print();
        }, 150);
    };

    return (
        <div className="h-screen bg-cyber-black flex flex-col overflow-hidden relative">

            {/* --- NEW: PRINT WARNING MODAL --- */}
            {showPrintWarning && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm print:hidden p-4">
                    <div className="max-w-md w-full bg-cyber-black border border-cyber-pink p-8 shadow-[0_0_40px_rgba(255,49,140,0.15)] relative">
                        {/* Decorative corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-pink"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-pink"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-pink"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-pink"></div>

                        <div className="flex items-center gap-4 mb-6 border-b border-cyber-pink/30 pb-4">
                            <AlertTriangle className="w-8 h-8 text-cyber-pink" />
                            <h3 className="text-xl font-sans font-bold text-white uppercase tracking-widest">
                                PRINT_CONFIGURATION
                            </h3>
                        </div>

                        <div className="space-y-4 font-mono text-sm text-cyber-muted mb-8 leading-relaxed">
                            <p>
                                To generate an accurate PDF matrix, you must instruct your browser to render background elements.
                            </p>
                            <div className="bg-cyber-pink/10 border border-cyber-pink/30 p-4">
                                <span className="text-cyber-pink font-bold uppercase block mb-1">Required Action:</span>
                                In the print dialog that appears next, expand <strong className="text-white">"More settings"</strong> and check the box for <strong className="text-white">"Background graphics"</strong> (or "Print Backgrounds").
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 items-center">
                            <button onClick={() => setShowPrintWarning(false)} className="font-mono text-xs text-cyber-muted hover:text-white transition-colors">
                                [ CANCEL ]
                            </button>
                            <CyberButton variant="primary" onClick={executePrint}>
                                ACKNOWLEDGE_&_PRINT
                            </CyberButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Navigation Bar - HIDDEN ON PRINT */}
            <header className="flex-none flex items-center justify-between p-4 border-b border-cyber-border bg-cyber-black z-20 print:hidden">
                <div className="flex items-center gap-4">
                    <Link to="/services/brand-book" className="text-cyber-muted hover:text-cyber-pink transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-sans font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Settings className="w-5 h-5 text-cyber-cyan" />
                        BRAND_EDITOR_WORKSPACE
                    </h1>
                </div>
                <CyberButton variant="primary" icon={Printer} onClick={triggerPrintWarning}>
                    SAVE_AS_PDF
                </CyberButton>
            </header>

            {/* Split Workspace Layout */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT PANE: Scrollable Controls - HIDDEN ON PRINT */}
                <aside className="w-full lg:w-[450px] overflow-y-auto border-r border-cyber-border bg-cyber-black p-6 space-y-10 custom-scrollbar print:hidden">

                    {/* Identity & Multi-Logo */}
                    <section className="space-y-4">
                        <h3 className="font-mono text-sm text-cyber-pink font-bold flex items-center gap-2 uppercase border-b border-cyber-border/50 pb-2">
                            <Type className="w-4 h-4" /> Identity & Marks
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="font-mono text-xs text-cyber-muted block mb-1">Brand Name</label>
                                <input type="text" name="name" value={config.name} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 focus:border-cyber-cyan outline-none" />
                            </div>
                            <div>
                                <label className="font-mono text-xs text-cyber-muted block mb-1">Brand Slogan</label>
                                <input type="text" name="slogan" value={config.slogan} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 focus:border-cyber-cyan outline-none" />
                            </div>

                            <div>
                                <label className="font-mono text-xs text-cyber-muted block mb-2">Brand Assets</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <input type="file" accept="image/*" id="logo-primary" className="hidden" onChange={(e) => handleLogoUpload(e, 'primaryLogo')} />
                                        <label htmlFor="logo-primary" className="w-full h-20 border border-dashed border-cyber-border hover:border-cyber-cyan bg-cyber-panel/30 text-cyber-muted hover:text-cyber-cyan transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer overflow-hidden p-1">
                                            {config.primaryLogo ? <img src={config.primaryLogo} alt="Primary" className="w-full h-full object-contain" /> : <><Upload className="w-4 h-4" /><span className="font-mono text-[10px] text-center">Primary<br />Logo</span></>}
                                        </label>
                                    </div>
                                    <div>
                                        <input type="file" accept="image/*" id="logo-secondary" className="hidden" onChange={(e) => handleLogoUpload(e, 'secondaryLogo')} />
                                        <label htmlFor="logo-secondary" className="w-full h-20 border border-dashed border-cyber-border hover:border-cyber-cyan bg-cyber-panel/30 text-cyber-muted hover:text-cyber-cyan transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer overflow-hidden p-1">
                                            {config.secondaryLogo ? <img src={config.secondaryLogo} alt="Secondary" className="w-full h-full object-contain" /> : <><Upload className="w-4 h-4" /><span className="font-mono text-[10px] text-center">Secondary<br />Logo</span></>}
                                        </label>
                                    </div>
                                    <div>
                                        <input type="file" accept="image/*" id="logo-icon" className="hidden" onChange={(e) => handleLogoUpload(e, 'icon')} />
                                        <label htmlFor="logo-icon" className="w-full h-20 border border-dashed border-cyber-border hover:border-cyber-cyan bg-cyber-panel/30 text-cyber-muted hover:text-cyber-cyan transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer overflow-hidden p-1">
                                            {config.icon ? <img src={config.icon} alt="Icon" className="w-full h-full object-contain" /> : <><Upload className="w-4 h-4" /><span className="font-mono text-[10px] text-center">Icon /<br />Mark</span></>}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Colors & UI */}
                    <section className="space-y-4">
                        <h3 className="font-mono text-sm text-[#FF318C] font-bold flex items-center gap-2 uppercase border-b border-cyber-border/50 pb-2">
                            <Palette className="w-4 h-4" /> Palette & Geometry
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['primary', 'secondary', 'background', 'text', 'secondaryText'].map((c) => (
                                <div key={c} className="space-y-1">
                                    <label className="font-mono text-xs text-cyber-muted uppercase">{c}</label>
                                    <div className="flex items-center gap-2 bg-cyber-panel border border-cyber-border p-1">
                                        <input type="color" name={c} value={config[c]} onChange={handleConfigChange} className="w-8 h-8 bg-transparent cursor-pointer" />
                                        <input type="text" name={c} value={config[c]} onChange={handleConfigChange} className="w-full bg-transparent text-white font-mono text-xs uppercase outline-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <label className="font-mono text-xs text-cyber-muted block mt-4 mb-2">Border Radius</label>
                        <div className="flex gap-2">
                            {[{ label: 'Sharp', val: '0px' }, { label: 'Soft', val: '8px' }, { label: 'Round', val: '24px' }].map(btn => (
                                <button key={btn.val} onClick={() => setConfig({ ...config, borderRadius: btn.val })} className={`flex-1 py-2 font-mono text-xs border ${config.borderRadius === btn.val ? 'border-cyber-pink text-cyber-pink bg-cyber-pink/10' : 'border-cyber-border text-cyber-muted hover:border-white'}`}>
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Typography */}
                    <section className="space-y-4">
                        <h3 className="font-mono text-sm text-cyber-cyan font-bold flex items-center gap-2 uppercase border-b border-cyber-border/50 pb-2">
                            <Type className="w-4 h-4" /> Typography
                        </h3>
                        <div className="space-y-4">
                            {FONTS.map(font => (
                                <div key={font.name} className={`p-4 border transition-colors ${config.typography === font.name ? 'border-cyber-cyan bg-cyber-cyan/5' : 'border-cyber-border hover:border-cyber-muted'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-white font-bold text-base" style={{ fontFamily: font.name }}>{font.name}</h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="text-[10px] font-mono text-cyber-muted bg-cyber-panel px-1">{font.type}</span>
                                                <span className="text-[10px] font-mono text-cyber-muted bg-cyber-panel px-1">{font.license}</span>
                                                {font.tags.map(tag => <span key={tag} className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-1">{tag}</span>)}
                                            </div>
                                        </div>
                                        <button onClick={() => setConfig({ ...config, typography: font.name })} className={`font-mono text-xs px-3 py-1 mt-1 ${config.typography === font.name ? 'bg-cyber-cyan text-black font-bold' : 'bg-cyber-panel text-cyber-muted'}`}>
                                            {config.typography === font.name ? 'ACTIVE' : 'SELECT'}
                                        </button>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-cyber-border/50 font-mono text-[10px] leading-relaxed text-cyber-muted overflow-hidden" style={{ fontFamily: font.name }}>
                                        The Quick Brown Fox<br />
                                        ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                                        abcdefghijklmnopqrstuvwxyz<br />
                                        !@#$%<br />
                                        1234567890
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Company Profile & Voice */}
                    <section className="space-y-4">
                        <h3 className="font-mono text-sm text-cyber-pink font-bold flex items-center gap-2 uppercase border-b border-cyber-border/50 pb-2">
                            <Mic className="w-4 h-4" /> Profile & Voice
                        </h3>
                        <textarea name="mission" placeholder="Mission Statement" value={config.mission} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 text-sm h-20 outline-none" />
                        <textarea name="vision" placeholder="Vision Statement" value={config.vision} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 text-sm h-20 outline-none" />
                        <input type="text" name="voiceKeywords" placeholder="Keywords (e.g. Bold, Clean, Modern)" value={config.voiceKeywords} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 text-sm outline-none" />
                        <textarea name="voiceDescription" placeholder="Voice Description" value={config.voiceDescription} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 text-sm h-20 outline-none" />
                    </section>

                    {/* Team Members */}
                    <section className="space-y-4">
                        <h3 className="font-mono text-sm text-cyber-cyan font-bold flex items-center gap-2 uppercase border-b border-cyber-border/50 pb-2">
                            <Users className="w-4 h-4" /> Team Members
                        </h3>
                        {team.map((member, index) => (
                            <div key={member.id} className="p-4 border border-cyber-border bg-cyber-panel/20 space-y-3 relative">
                                <button onClick={() => removeItem(setTeam, member.id)} className="absolute top-2 right-2 text-cyber-muted hover:text-red-500"><X className="w-4 h-4" /></button>

                                <div className="flex gap-4">
                                    <div>
                                        <input type="file" accept="image/*" id={`team-${member.id}`} className="hidden" onChange={(e) => handleTeamPhoto(member.id, e)} />
                                        <label htmlFor={`team-${member.id}`} className="w-20 h-20 shrink-0 border border-dashed border-cyber-border flex flex-col items-center justify-center text-cyber-muted hover:text-cyber-cyan cursor-pointer overflow-hidden bg-cyber-black">
                                            {member.photo ? <img src={member.photo} alt="team" className="w-full h-full object-cover" /> : <span className="text-[10px] text-center p-1">+ Photo</span>}
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Name" value={member.name} onChange={(e) => handleDynamicChange(setTeam, member.id, 'name', e.target.value)} className="w-full bg-cyber-black border border-cyber-border text-white font-mono p-2 text-sm outline-none" />
                                            <input type="text" placeholder="Role" value={member.role} onChange={(e) => handleDynamicChange(setTeam, member.id, 'role', e.target.value)} className="w-full bg-cyber-black border border-cyber-border text-white font-mono p-2 text-sm outline-none" />
                                        </div>
                                        <input type="text" placeholder="Short Story / Tagline" value={member.story} onChange={(e) => handleDynamicChange(setTeam, member.id, 'story', e.target.value)} className="w-full bg-cyber-black border border-cyber-border text-white font-mono p-2 text-sm outline-none" />
                                    </div>
                                </div>

                                <textarea placeholder="Full Bio" value={member.bio} onChange={(e) => handleDynamicChange(setTeam, member.id, 'bio', e.target.value)} className="w-full bg-cyber-black border border-cyber-border text-white font-mono p-2 text-sm h-20 outline-none mt-2" />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                    <input type="text" placeholder="Email" value={member.contact} onChange={(e) => handleDynamicChange(setTeam, member.id, 'contact', e.target.value)} className="w-full bg-cyber-black border border-cyber-border text-white font-mono p-2 text-xs outline-none" />
                                    <input type="text" placeholder="LinkedIn" value={member.link1} onChange={(e) => handleDynamicChange(setTeam, member.id, 'link1', e.target.value)} className="w-full bg-cyber-black border border-cyber-border text-white font-mono p-2 text-xs outline-none" />
                                    <input type="text" placeholder="Website" value={member.link2} onChange={(e) => handleDynamicChange(setTeam, member.id, 'link2', e.target.value)} className="w-full bg-cyber-black border border-cyber-border text-white font-mono p-2 text-xs outline-none" />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => addItem(setTeam, { name: '', role: '', photo: null, story: '', bio: '', contact: '', link1: '', link2: '' })} className="w-full py-2 border border-cyber-border text-cyber-muted font-mono text-sm hover:text-white hover:border-cyber-cyan transition-colors">
                            + ADD MEMBER
                        </button>
                    </section>

                    {/* Contact & Socials */}
                    <section className="space-y-4 pb-12">
                        <h3 className="font-mono text-sm text-[#FF318C] font-bold flex items-center gap-2 uppercase border-b border-cyber-border/50 pb-2">
                            <Share2 className="w-4 h-4" /> Contact & Socials
                        </h3>
                        <div className="space-y-4">
                            <input type="email" name="email" placeholder="Official Email" value={config.email} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 text-sm outline-none focus:border-cyber-cyan" />
                            <input type="text" name="website" placeholder="Website URL" value={config.website} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 text-sm outline-none focus:border-cyber-cyan" />
                            <input type="text" name="phone" placeholder="Phone (Optional)" value={config.phone} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 text-sm outline-none focus:border-cyber-cyan" />
                            <input type="text" name="address" placeholder="Address (Optional)" value={config.address} onChange={handleConfigChange} className="w-full bg-cyber-panel border border-cyber-border text-white font-mono p-2 text-sm outline-none focus:border-cyber-cyan" />
                        </div>

                        <div className="space-y-3 pt-4">
                            <h4 className="font-mono text-xs text-cyber-muted uppercase block">Social Media Links</h4>
                            {socials.map((social) => (
                                <div key={social.id} className="flex gap-2 relative">
                                    <input type="text" placeholder="Platform" value={social.platform} onChange={(e) => handleDynamicChange(setSocials, social.id, 'platform', e.target.value)} className="w-1/3 bg-cyber-black border border-cyber-border text-white font-mono p-2 text-sm outline-none focus:border-cyber-cyan" />
                                    <input type="text" placeholder="URL or Handle" value={social.url} onChange={(e) => handleDynamicChange(setSocials, social.id, 'url', e.target.value)} className="w-full bg-cyber-black border border-cyber-border text-white font-mono p-2 text-sm outline-none focus:border-cyber-cyan" />
                                    <button onClick={() => removeItem(setSocials, social.id)} className="shrink-0 px-2 border border-cyber-border text-cyber-muted hover:text-red-500 hover:border-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => addItem(setSocials, { platform: '', url: '' })} className="w-full py-2 border border-dashed border-cyber-border text-cyber-muted font-mono text-sm hover:text-white hover:border-cyber-cyan transition-colors">
                                + ADD SOCIAL LINK
                            </button>
                        </div>
                    </section>

                </aside>

                {/* RIGHT PANE: Scrollable Live Preview Dashboard */}
                <main className="flex-1 relative overflow-y-auto p-4 md:p-12 bg-neutral-200 custom-scrollbar flex justify-center items-start print:p-0 print:bg-white">

                    {/* The "Paper" Document */}
                    {/* NEW: Added WebkitPrintColorAdjust directly to the style object to force background color printing! */}
                    <div
                        className="w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col transition-all duration-300 print:max-w-none print:w-full print:shadow-none print:min-h-0 print:m-0"
                        style={{
                            backgroundColor: config.background,
                            fontFamily: config.typography,
                            color: config.text,
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact'
                        }}
                    >
                        {/* Decorative Header Bar */}
                        <div className="h-4 w-full flex">
                            <div className="h-full w-2/3" style={{ backgroundColor: config.primary }} />
                            <div className="h-full w-1/3" style={{ backgroundColor: config.secondary }} />
                        </div>

                        <div className="p-12 space-y-12">

                            {/* Header Section */}
                            <div className="flex justify-between items-start border-b pb-8" style={{ borderColor: config.secondaryText + '40' }}>
                                <div className="max-w-lg">
                                    {config.primaryLogo && <img src={config.primaryLogo} alt="Primary Brand Logo" className="h-16 mb-4 object-contain" />}
                                    <h2 className="text-5xl font-bold tracking-tighter" style={{ color: config.primary }}>
                                        {config.name || 'BRAND_NAME'}
                                    </h2>
                                    <p className="text-lg mt-2 font-medium" style={{ color: config.secondaryText }}>
                                        {config.slogan || 'Your slogan here.'}
                                    </p>
                                </div>
                                {/* Theme Swatches */}
                                <div className="flex shadow-lg" style={{ borderRadius: config.borderRadius, overflow: 'hidden' }}>
                                    <div className="w-10 h-10" style={{ backgroundColor: config.primary }} />
                                    <div className="w-10 h-10" style={{ backgroundColor: config.secondary }} />
                                    <div className="w-10 h-10" style={{ backgroundColor: config.text }} />
                                </div>
                            </div>

                            {/* Logo & Iconography Showcase Grid */}
                            {(config.primaryLogo || config.secondaryLogo || config.icon) && (
                                <div>
                                    <h4 className="text-sm uppercase tracking-widest mb-6 font-bold" style={{ color: config.primary }}>Logo & Iconography</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 border items-center justify-center text-center" style={{ borderColor: config.secondaryText + '40', borderRadius: config.borderRadius, backgroundColor: config.secondary + '10' }}>
                                        {config.primaryLogo && (
                                            <div className="flex flex-col items-center gap-4">
                                                <img src={config.primaryLogo} alt="Primary" className="h-20 object-contain" />
                                                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: config.secondaryText }}>Primary Lockup</span>
                                            </div>
                                        )}
                                        {config.secondaryLogo && (
                                            <div className="flex flex-col items-center gap-4 border-l border-r px-4" style={{ borderColor: config.secondaryText + '20' }}>
                                                <img src={config.secondaryLogo} alt="Secondary" className="h-16 object-contain" />
                                                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: config.secondaryText }}>Secondary Mark</span>
                                            </div>
                                        )}
                                        {config.icon && (
                                            <div className="flex flex-col items-center gap-4">
                                                <img src={config.icon} alt="Icon" className="h-12 object-contain" />
                                                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: config.secondaryText }}>Icon / Favicon</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Company Profile Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h4 className="text-sm uppercase tracking-widest mb-4 font-bold" style={{ color: config.primary }}>Mission</h4>
                                    <p className="text-base leading-relaxed" style={{ color: config.text }}>
                                        {config.mission || 'Define your mission here.'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm uppercase tracking-widest mb-4 font-bold" style={{ color: config.secondary }}>Vision</h4>
                                    <p className="text-base leading-relaxed" style={{ color: config.text }}>
                                        {config.vision || 'Define your vision here.'}
                                    </p>
                                </div>
                            </div>

                            {/* UI & Typography Section */}
                            <div className="p-8 border" style={{ borderColor: config.secondaryText + '40', borderRadius: config.borderRadius, backgroundColor: config.secondary + '10' }}>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    <div className="lg:col-span-5 space-y-6">
                                        <h4 className="text-sm uppercase tracking-widest font-bold" style={{ color: config.primary }}>UI Components</h4>
                                        <div className="flex flex-col gap-4 items-start">
                                            <button className="px-6 py-3 font-bold shadow-lg" style={{ backgroundColor: config.primary, color: config.background, borderRadius: config.borderRadius }}>
                                                Primary Action
                                            </button>
                                            <button className="px-6 py-3 font-bold border" style={{ borderColor: config.secondary, color: config.text, borderRadius: config.borderRadius }}>
                                                Secondary Action
                                            </button>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-7 space-y-4">
                                        <h4 className="text-sm uppercase tracking-widest font-bold" style={{ color: config.primary }}>Typography</h4>
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-bold mb-1">{activeFont.name}</h1>

                                            <div className="flex flex-wrap gap-2 text-xs font-mono mb-6" style={{ color: config.secondaryText }}>
                                                <span>{activeFont.type}</span>
                                                <span>•</span>
                                                <span>{activeFont.license}</span>
                                                {activeFont.tags.map(tag => (
                                                    <React.Fragment key={tag}>
                                                        <span>•</span>
                                                        <span>{tag}</span>
                                                    </React.Fragment>
                                                ))}
                                            </div>

                                            <div className="text-lg leading-relaxed break-all" style={{ color: config.text }}>
                                                The Quick Brown Fox<br />
                                                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                                                abcdefghijklmnopqrstuvwxyz<br />
                                                !@#$%<br />
                                                1234567890
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tone of Voice Section */}
                            <div>
                                <h4 className="text-sm uppercase tracking-widest mb-4 font-bold" style={{ color: config.primary }}>Tone of Voice</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {config.voiceKeywords.split(',').map((kw, i) => kw.trim() && (
                                        <span key={i} className="px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: config.secondary + '20', color: config.text, borderRadius: config.borderRadius }}>
                                            {kw.trim()}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm leading-relaxed max-w-2xl" style={{ color: config.secondaryText }}>
                                    {config.voiceDescription || 'Describe how your brand communicates.'}
                                </p>
                            </div>

                            {/* Team Section */}
                            {team.length > 0 && team[0].name !== '' && (
                                <div className="break-inside-avoid">
                                    <h4 className="text-sm uppercase tracking-widest mb-6 font-bold" style={{ color: config.primary }}>Leadership & Team</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {team.map(member => (
                                            <div key={member.id} className="flex flex-col p-6 border" style={{ borderColor: config.secondaryText + '20', borderRadius: config.borderRadius }}>

                                                <div className="flex items-center gap-6 mb-4">
                                                    <div className="w-16 h-16 shrink-0 overflow-hidden" style={{ borderRadius: config.borderRadius }}>
                                                        {member.photo ? (
                                                            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center opacity-20" style={{ backgroundColor: config.secondary }}>
                                                                <Users className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-lg" style={{ color: config.text }}>{member.name || 'Name'}</h5>
                                                        <span className="text-xs font-mono tracking-widest uppercase block mb-1" style={{ color: config.primary }}>{member.role || 'Role'}</span>
                                                        {member.story && (
                                                            <span className="text-xs italic" style={{ color: config.secondaryText }}>"{member.story}"</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {member.bio && (
                                                    <p className="text-xs leading-relaxed mb-4" style={{ color: config.secondaryText }}>
                                                        {member.bio}
                                                    </p>
                                                )}

                                                <div className="mt-auto pt-3 border-t flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-mono" style={{ borderColor: config.secondaryText + '20' }}>
                                                    {member.contact && <span style={{ color: config.text }}>{member.contact}</span>}
                                                    {member.link1 && <span style={{ color: config.secondaryText }}>{member.link1}</span>}
                                                    {member.link2 && <span style={{ color: config.secondaryText }}>{member.link2}</span>}
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contact & Reach Section */}
                            <div className="break-inside-avoid pb-8">
                                <h4 className="text-sm uppercase tracking-widest mb-6 font-bold" style={{ color: config.primary }}>Contact & Reach</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border" style={{ borderColor: config.secondaryText + '30', borderRadius: config.borderRadius, backgroundColor: config.secondary + '10' }}>

                                    <div className="space-y-4">
                                        <h5 className="font-bold text-base" style={{ color: config.text }}>Get in Touch</h5>
                                        <div className="text-sm space-y-2 leading-relaxed" style={{ color: config.secondaryText }}>
                                            {config.email && <p><strong style={{ color: config.text }}>Email:</strong> {config.email}</p>}
                                            {config.phone && <p><strong style={{ color: config.text }}>Phone:</strong> {config.phone}</p>}
                                            {config.website && <p><strong style={{ color: config.text }}>Web:</strong> {config.website}</p>}
                                            {config.address && <p><strong style={{ color: config.text }}>HQ:</strong> {config.address}</p>}
                                        </div>
                                    </div>

                                    {socials.length > 0 && socials[0].platform !== '' && (
                                        <div className="space-y-4 md:border-l md:pl-8 border-t md:border-t-0 pt-4 md:pt-0" style={{ borderColor: config.secondaryText + '30' }}>
                                            <h5 className="font-bold text-base" style={{ color: config.text }}>Social Matrix</h5>
                                            <div className="text-sm space-y-2 font-mono">
                                                {socials.map(social => social.platform && (
                                                    <p key={social.id} style={{ color: config.secondaryText }}>
                                                        <span style={{ color: config.primary }}>{social.platform}:</span> {social.url}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="mt-auto p-6 border-t flex justify-between text-xs" style={{ borderColor: config.secondaryText + '30', color: config.secondaryText, backgroundColor: config.background }}>
                            <span>contact: {config.email}</span>
                            <span className="font-mono tracking-widest uppercase">Generated by GNRHUB</span>
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
};

export default BrandBookEditor;