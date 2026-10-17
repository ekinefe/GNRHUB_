import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { brand } from '@/shared/config/brand';
import { profile } from '@/shared/config/profile';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { LegalLayout, Section } from './LegalLayout';

export const TERMS_UPDATED = '2026-10-16';

const Terms = () => {
    useDocumentMeta({ title: 'Terms', description: 'Terms of use for this site.' });
    return (
        <LegalLayout icon={ShieldAlert} iconClass="text-cyber-pink" title="Terms" tag="SYSTEM_PROTOCOLS" updated={TERMS_UPDATED}>
            <p className="text-white">
                Short version: {brand.name} is a personal portfolio. You may read it and link to it. It comes as it is, without guarantees.
            </p>

            <Section n="01" title="USING THE SITE">
                <p>By using {brand.name} you agree to these terms. If you do not agree, please do not use the site.</p>
            </Section>

            <Section n="02" title="AS IS">
                <p>The site is provided "as is" and "as available". It is a personal project, so there is no promise about uptime, accuracy or fitness for a particular purpose. Information about projects and experience is shared in good faith and may become out of date.</p>
            </Section>

            <Section n="03" title="LIABILITY">
                <p>To the extent the law allows, I am not liable for losses that result from using the site or from links to other sites. Nothing here limits liability that cannot be limited by law.</p>
            </Section>

            <Section n="04" title="OWNERSHIP AND CREDITS">
                <p>The text, design and source code of this site are mine unless stated otherwise (see the LICENSE file in the repository). The site uses open-source software, including React, Tailwind CSS, Lucide icons, GSAP, and components adapted from React Bits, plus the fonts JetBrains Mono and Space Grotesk (SIL Open Font License). These remain the property of their authors and are used under their own licenses.</p>
            </Section>

            <Section n="05" title="LINKS">
                <p>External links are provided for convenience. I do not control those sites and am not responsible for their content.</p>
            </Section>

            <Section n="06" title="LAW AND CONTACT">
                <p>These terms are governed by Polish law. Questions: <a className="text-cyber-pink underline underline-offset-2 hover:no-underline" href={`mailto:${profile.email}`}>{profile.email}</a>.</p>
            </Section>
        </LegalLayout>
    );
};

export default Terms;
