import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import TurnstileField from './TurnstileField';

afterEach(() => { delete window.turnstile; });

describe('TurnstileField', () => {
    it('renders nothing without a site key', () => {
        const { container } = render(<TurnstileField siteKey="" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the widget and passes the token on', async () => {
        const turnstile = { render: vi.fn((el, opts) => { opts.callback('tok-1'); return 'w1'; }), remove: vi.fn() };
        window.turnstile = turnstile;
        const onToken = vi.fn();
        const { unmount, getByTestId } = render(<TurnstileField siteKey="site" onToken={onToken} />);
        expect(getByTestId('turnstile')).toBeInTheDocument();
        await waitFor(() => expect(onToken).toHaveBeenCalledWith('tok-1'));
        expect(turnstile.render.mock.calls[0][1].sitekey).toBe('site');
        unmount();
        expect(turnstile.remove).toHaveBeenCalledWith('w1');
    });
});
