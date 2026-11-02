import React from 'react';
import Markdown from '@/shared/lib/markdown/Markdown';
import { LegalLayout } from './LegalLayout';

const day = (seconds) => new Date(seconds * 1000).toISOString().slice(0, 10);

// A text saved in the admin panel: the plain-language summary first, then the Markdown body.
const SavedDocument = ({ saved, icon, iconClass, title }) => (
    <LegalLayout icon={icon} iconClass={iconClass} title={title} tag={`VERSION_${saved.version}`} updated={day(saved.createdAt)}>
        <p className="text-white">Short version: {saved.summary}</p>
        <Markdown source={saved.body} />
    </LegalLayout>
);

export default SavedDocument;
