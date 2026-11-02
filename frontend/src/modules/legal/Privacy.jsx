import React from 'react';
import { Database } from 'lucide-react';
import { brand } from '@/shared/config/brand';
import { profile } from '@/shared/config/profile';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import { LegalLayout, Section } from './LegalLayout';
import SavedDocument from './SavedDocument';
import { useLegalDocument } from './useLegalDocument';

export const PRIVACY_UPDATED = '2026-11-03';

const Privacy = () => {
    const saved = useLegalDocument('privacy');
    useDocumentMeta({ title: 'Privacy', description: 'How this site handles your data: short version, almost nothing is collected.' });
    if (saved) return <SavedDocument saved={saved} icon={Database} iconClass="text-cyber-cyan" title="Privacy" />;
    return (
        <LegalLayout icon={Database} iconClass="text-cyber-cyan" title="Privacy" tag="DATA_DIRECTIVES" updated={PRIVACY_UPDATED}>
            <p className="text-white">
                Short version: {brand.name} is a personal portfolio. Visitors have no accounts, and the site has no advertising, no tracking scripts and sets no cookies for visitors. The only data processed is the standard hosting log described below, a simple count of how many times each page is opened, the message you send if you use the contact form or the report form, and a short-lived counter if someone tries to sign in to the owner's admin area.
            </p>

            <Section n="01" title="WHO IS RESPONSIBLE">
                <p>Ekin Efe Gungor, Warsaw, Poland, is the controller of this site. Contact: <a className="text-cyber-pink underline underline-offset-2 hover:no-underline" href={`mailto:${profile.email}`}>{profile.email}</a>.</p>
            </Section>

            <Section n="02" title="WHAT IS COLLECTED">
                <p><strong className="text-white">Hosting logs.</strong> The site is served by Cloudflare. When you load a page, Cloudflare processes technical request data (IP address, browser type, requested URL, time) to deliver the site and protect it from abuse. I do not receive this data in a form that identifies visitors and I do not use it for profiling. How long Cloudflare keeps it is set by Cloudflare; see its privacy policy.</p>
                <p><strong className="text-white">Page counts.</strong> To see whether anyone reads the site, it counts how many times each page is opened per day (for example "/about, 3 June, 12 times"). Only the page and the day are stored: no address, no cookie, no identifier, no referrer and no browser details, so a count cannot be tied to a person. Browsers that send "Do Not Track" or "Global Privacy Control" are not counted. Counts older than 90 days are deleted. They are held in the same Cloudflare D1 database and readable only by me.</p>
                <p><strong className="text-white">Contact form.</strong> If you send a message through the contact form, I store your name, email address, the subject and the message, and the time. I use them only to read and answer your message. They are kept until I delete them, and I will delete yours on request. To limit spam, a keyed hash of your network address (not the address itself) is counted for up to about a day. The messages are held in a Cloudflare D1 database and are readable only by me, in a password-protected admin area. No email is sent from the site yet; I read messages there.</p>
                <p><strong className="text-white">Report a problem.</strong> The "Report a problem" form stores your message, the page you came from, the kind of report and the time. The email address is optional and only stored if you give it, to reply. Reports are kept until I delete them, and I will delete yours on request. Spam is limited the same way as for the contact form: a keyed hash of your network address (not the address itself) is counted for up to about a day.</p>
                <p><strong className="text-white">Admin sign-in attempts.</strong> The site has a private admin area for its owner. If someone tries to sign in there, a keyed hash of their network address (not the address itself) is counted for up to about an hour to stop password guessing. Nothing else about the attempt is kept.</p>
                <p><strong className="text-white">Nothing else.</strong> There are no visitor accounts, no third-party analytics or tracking scripts, no advertising and no social-media embeds.</p>
            </Section>

            <Section n="03" title="COOKIES AND LOCAL STORAGE">
                <p>This site sets no cookies for visitors (the owner's admin sign-in sets one session cookie, only after a correct sign-in). Your browser keeps your display choices on your own device (the "Reduce effects" switch, the accent colour and the scanlines switch in the footer) and, if a page fails to load, a short-lived flag that limits automatic reload to one try. These stay in your browser, are never sent to a server, and are needed to make the site work as you asked, so no consent banner is needed.</p>
            </Section>

            <Section n="04" title="FONTS AND THIRD PARTIES">
                <p>Fonts (JetBrains Mono, Space Grotesk) are served from this site, not from Google or any other font service, so loading a page contacts no third party besides the host. Links to GitHub, LinkedIn and other sites leave this site; those sites have their own policies.</p>
            </Section>

            <Section n="05" title="EMAIL">
                <p>If you write to me by email instead of using a form, I use your message and address only to reply, and delete the conversation when it is no longer needed.</p>
            </Section>

            <Section n="06" title="YOUR RIGHTS">
                <p>Under the GDPR you can ask what data I hold about you, and ask for correction or deletion of it. Write to the address above. You can also complain to the Polish data protection authority (UODO, uodo.gov.pl).</p>
            </Section>

            <Section n="07" title="CHANGES">
                <p>If this site starts collecting anything (for example accounts), this page will be updated first. The date at the top shows the latest version.</p>
            </Section>
        </LegalLayout>
    );
};

export default Privacy;
