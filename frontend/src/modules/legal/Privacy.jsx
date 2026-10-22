import React from 'react';
import { Database } from 'lucide-react';
import { brand } from '@/shared/config/brand';
import { profile } from '@/shared/config/profile';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { LegalLayout, Section } from './LegalLayout';

export const PRIVACY_UPDATED = '2026-10-22';

const Privacy = () => {
    useDocumentMeta({ title: 'Privacy', description: 'How this site handles your data: short version, nothing is collected.' });
    return (
        <LegalLayout icon={Database} iconClass="text-cyber-cyan" title="Privacy" tag="DATA_DIRECTIVES" updated={PRIVACY_UPDATED}>
            <p className="text-white">
                Short version: {brand.name} is a personal portfolio. It has no accounts, no analytics, no advertising and no cookies. The only data processed is the standard hosting log described below.
            </p>

            <Section n="01" title="WHO IS RESPONSIBLE">
                <p>Ekin Efe Gungor, Warsaw, Poland, is the controller of this site. Contact: <a className="text-cyber-pink underline underline-offset-2 hover:no-underline" href={`mailto:${profile.email}`}>{profile.email}</a>.</p>
            </Section>

            <Section n="02" title="WHAT IS COLLECTED">
                <p><strong className="text-white">Hosting logs.</strong> The site is served by Cloudflare. When you load a page, Cloudflare processes technical request data (IP address, browser type, requested URL, time) to deliver the site and protect it from abuse. I do not receive this data in a form that identifies visitors and I do not use it for profiling. How long Cloudflare keeps it is set by Cloudflare; see its privacy policy.</p>
                <p><strong className="text-white">Nothing else.</strong> There are no accounts or forms, no analytics or tracking scripts, no advertising and no social-media embeds.</p>
            </Section>

            <Section n="03" title="COOKIES AND LOCAL STORAGE">
                <p>This site sets no cookies. Your browser keeps your display choices on your own device (the "Reduce effects" switch, the accent colour and the scanlines switch in the footer) and, if a page fails to load, a short-lived flag that limits automatic reload to one try. These stay in your browser, are never sent to a server, and are needed to make the site work as you asked, so no consent banner is needed.</p>
            </Section>

            <Section n="04" title="FONTS AND THIRD PARTIES">
                <p>Fonts (JetBrains Mono, Space Grotesk) are served from this site, not from Google or any other font service, so loading a page contacts no third party besides the host. Links to GitHub, LinkedIn and other sites leave this site; those sites have their own policies.</p>
            </Section>

            <Section n="05" title="EMAIL">
                <p>The contact page is a plain email link; there is no contact form. If you write to me, I use your message and address only to reply, and delete the conversation when it is no longer needed.</p>
            </Section>

            <Section n="06" title="YOUR RIGHTS">
                <p>Under the GDPR you can ask what data I hold about you, and ask for correction or deletion of it. Write to the address above. You can also complain to the Polish data protection authority (UODO, uodo.gov.pl).</p>
            </Section>

            <Section n="07" title="CHANGES">
                <p>If this site starts collecting anything (for example accounts or analytics), this page will be updated first. The date at the top shows the latest version.</p>
            </Section>
        </LegalLayout>
    );
};

export default Privacy;
