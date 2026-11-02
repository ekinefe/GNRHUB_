import React, { useState } from 'react';
import { Send } from 'lucide-react';
import CyberButton from '@/shared/ui/CyberButton';
import Input from '@/shared/ui/Input';
import Textarea from '@/shared/ui/Textarea';
import { profile } from '@/shared/config/profile';

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' };

function failureMessage(status, retryAfter) {
    if (status === 429) return `You sent several messages recently. Please try again in ${Math.max(1, Math.ceil(retryAfter / 60))} minutes, or email me.`;
    if (status === 503) return 'Messages are not available right now. Please email me instead.';
    if (status === 413) return 'That message is too long.';
    if (status === 403) return 'The message was refused. Reload the page and try again, or email me.';
    return 'Could not send the message. Check your connection, or email me instead.';
}

// The contact form (ADR 0009). The `website` field is a trap for bots: people never see it, so it stays empty.
const ContactForm = () => {
    const [values, setValues] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [problem, setProblem] = useState('');
    const [state, setState] = useState('idle'); // idle | sending | sent

    const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setState('sending');
        setErrors({});
        setProblem('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (res.ok) { setValues(EMPTY); setState('sent'); return; }
            let data = null;
            try { data = await res.json(); } catch { /* not JSON */ }
            if (res.status === 400 && data?.errors) setErrors(data.errors);
            else setProblem(failureMessage(res.status, Number(res.headers.get('Retry-After')) || 0));
        } catch {
            setProblem(failureMessage(0, 0));
        }
        setState('idle');
    };

    if (state === 'sent') {
        return (
            <div role="status" className="space-y-4 font-mono text-sm">
                <p className="text-cyber-success">Your message was sent.</p>
                <p className="text-cyber-muted">If you need to add something, send another one or write to {profile.email}.</p>
                <CyberButton type="button" variant="secondary" onClick={() => setState('idle')}>Send another message</CyberButton>
            </div>
        );
    }

    return (
        <form onSubmit={submit} noValidate className="space-y-5 max-w-xl" aria-labelledby="contact-form-title">
            <h2 id="contact-form-title" className="font-mono text-sm text-cyber-muted">Or write to me here</h2>
            <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Name" name="name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} required maxLength={100} />
                <Input label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} hint="Only used to reply to you." required maxLength={200} />
            </div>
            <Input label="Subject" name="subject" value={values.subject} onChange={set('subject')} error={errors.subject} maxLength={150} />
            <Textarea label="Message" name="message" rows={6} value={values.message} onChange={set('message')} error={errors.message} required maxLength={5000} />
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>Leave this empty<input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} /></label>
            </div>
            {problem && <p role="alert" className="font-mono text-sm text-cyber-offline">{problem}</p>}
            <CyberButton type="submit" icon={Send} disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send message'}</CyberButton>
        </form>
    );
};

export default ContactForm;
