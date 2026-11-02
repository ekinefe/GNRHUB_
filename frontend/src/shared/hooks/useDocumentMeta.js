import { useEffect } from 'react';
import { brand } from '@/shared/config/brand';

function setTag(selector, create, value) {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = create();
        document.head.appendChild(el);
    }
    el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', value);
}

const meta = (attr, name) => () => {
    const el = document.createElement('meta');
    el.setAttribute(attr, name);
    return el;
};

// Per-page title, description, canonical, Open Graph and robots. Call once at the top of each routed page.
//   title        "Tools" -> "Tools · GNRdigital" (omit for the bare brand name)
//   noindex      true for 404 / error / login-style pages
export function useDocumentMeta({ title, description, noindex = false } = {}) {
    useEffect(() => {
        const fullTitle = title ? `${title} · ${brand.name}` : brand.name;
        const url = `${window.location.origin}${window.location.pathname}`;
        document.title = fullTitle;

        if (description) {
            setTag('meta[name="description"]', meta('name', 'description'), description);
            setTag('meta[property="og:description"]', meta('property', 'og:description'), description);
        }
        setTag('meta[property="og:title"]', meta('property', 'og:title'), fullTitle);
        setTag('meta[property="og:url"]', meta('property', 'og:url'), url);
        setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), url);
        setTag('meta[name="robots"]', meta('name', 'robots'), noindex ? 'noindex, nofollow' : 'index, follow');
    }, [title, description, noindex]);
}
