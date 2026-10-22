import React, { useEffect, useRef } from 'react';

// Cloudflare Turnstile widget (GNR-133). Renders nothing unless VITE_TURNSTILE_SITE_KEY is set,
// so forms work without it until the server enforces TURNSTILE_SECRET. The token goes to
// onToken; send it to the API as `cf-turnstile-response`.
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise;
const loadScript = () => {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    scriptPromise ??= new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = SCRIPT_SRC;
        el.async = true;
        el.onload = () => resolve(window.turnstile);
        el.onerror = () => { scriptPromise = undefined; reject(new Error('Turnstile failed to load')); };
        document.head.appendChild(el);
    });
    return scriptPromise;
};

const TurnstileField = ({ onToken, siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY, className = '' }) => {
    const box = useRef(null);

    useEffect(() => {
        if (!siteKey) return undefined;
        let widgetId;
        let cancelled = false;
        loadScript()
            .then((turnstile) => {
                if (cancelled || !box.current) return;
                widgetId = turnstile.render(box.current, {
                    sitekey: siteKey,
                    theme: 'dark',
                    callback: (token) => onToken?.(token),
                    'expired-callback': () => onToken?.(null),
                    'error-callback': () => onToken?.(null),
                });
            })
            .catch(() => onToken?.(null));
        return () => {
            cancelled = true;
            if (widgetId !== undefined) window.turnstile?.remove(widgetId);
        };
    }, [siteKey, onToken]);

    if (!siteKey) return null;
    return <div ref={box} className={className} data-testid="turnstile" />;
};

export default TurnstileField;
