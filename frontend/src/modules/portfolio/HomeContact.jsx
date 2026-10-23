import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import { profile } from '@/shared/config/profile';

// The last thing on Home: one clear next step.
const HomeContact = () => (
    <section aria-labelledby="contact-heading" className="py-14 border-t border-cyber-border">
        <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold text-white mb-3">Looking for a junior developer?</h2>
        <p className="font-mono text-cyber-muted text-sm md:text-base leading-relaxed max-w-xl mb-6">
            {profile.availability.open ? `${profile.availability.text}. ` : ''}Write to me about a role, an internship or a project.
        </p>
        <div className="flex flex-wrap gap-4">
            <Link to="/contact"><CyberButton variant="primary" icon={Mail}>Get in touch</CyberButton></Link>
            <Link to="/projects"><CyberButton variant="secondary">See all projects</CyberButton></Link>
        </div>
    </section>
);

export default HomeContact;
