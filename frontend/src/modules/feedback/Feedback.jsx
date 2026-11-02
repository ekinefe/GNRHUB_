import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import PageShell from '@/shared/layout/PageShell';
import CyberButton from '@/shared/ui/CyberButton';
import Select from '@/shared/ui/Select';
import Input from '@/shared/ui/Input';
import Textarea from '@/shared/ui/Textarea';
import { profile } from '@/shared/config/profile';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';

const KINDS = [
    { value: 'problem', label: 'Something is broken or wrong' },
    { value: 'idea', label: 'An idea or a suggestion' },
    { value: 'other', label: 'Something else' },
];

function failureMessage(status, retryAfter) {
    if (status === 429) return `You sent several reports recently. Please try again in ${Math.max(1, Math.ceil(retryAfter / 60))} minutes, or email me.`;
    if (status === 503) return 'Reports are not available right now. Please email me instead.';
    if (status === 403) return 'The report was refused. Reload the page and try again, or email me.';
    return 'Could not send the report. Check your connection, or email me instead.';
}

// "Report a problem" (GNR-148). The page you came from is filled in for you; the email is optional and only used to reply.
// The `website` field is a trap for bots: people never see it, so it stays empty.
const Feedback = () => {
    useDocumentMeta({ title: 'Report a problem', description: 'Tell me about a problem on this site or an idea for it.' });
    const [params] = useSearchParams();
    const from = params.get('page') ?? '';
    const [values, setValues] = useState({ kind: 'problem', message: '', email: '', website: '' });
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
            const res = await fetch('/api/feedback', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, page: from }),
            });
            if (res.ok) { setState('sent'); return; }
            let data = null;
            try { data = await res.json(); } catch { /* not JSON */ }
            if (res.status === 400 && data?.errors) setErrors(data.errors);
            else setProblem(failureMessage(res.status, Number(res.headers.get('Retry-After')) || 0));
        } catch {
            setProblem(failureMessage(0, 0));
        }
        setState('idle');
    };

    return (
        <PageShell width="5xl">
            <section className="relative pt-24 pb-24">
                <h1 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tighter mb-6">/REPORT</h1>
                {state === 'sent' ? (
                    <div role="status" className="space-y-4 font-mono text-sm">
                        <p className="text-cyber-success">Thank you, the report was sent.</p>
                        <p className="text-cyber-muted">I read every one. If it is urgent, write to {profile.email}.</p>
                    </div>
                ) : (
                    <form onSubmit={submit} noValidate aria-label="Report a problem" className="space-y-5 max-w-xl">
                        <p className="font-mono text-cyber-muted text-sm leading-relaxed">Found something broken, confusing or missing? Tell me what you saw. {from && <>It will be sent with the page you came from: <code className="text-cyber-text">{from}</code>.</>}</p>
                        <Select label="What is it about?" name="kind" value={values.kind} onChange={set('kind')} error={errors.kind} options={KINDS} />
                        <Textarea label="What happened?" name="message" rows={6} value={values.message} onChange={set('message')} error={errors.message} required maxLength={2000} hint="What you did, what you expected and what you saw." />
                        <Input label="Email (optional)" name="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} hint="Only used to reply to you. Leave it empty to stay anonymous." maxLength={200} />
                        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                            <label>Leave this empty<input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} /></label>
                        </div>
                        {problem && <p role="alert" className="font-mono text-sm text-cyber-offline">{problem}</p>}
                        <CyberButton type="submit" icon={Send} disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send report'}</CyberButton>
                    </form>
                )}
            </section>
        </PageShell>
    );
};

export default Feedback;
