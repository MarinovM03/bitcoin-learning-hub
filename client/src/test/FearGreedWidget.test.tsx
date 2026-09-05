import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import FearGreedWidget from '../components/fear-greed-widget/FearGreedWidget';
import { queryClient } from '../lib/queryClient';

const indexResponse = (value: number, label: string) =>
    new Response(JSON.stringify({ data: [{ value: String(value), value_classification: label }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

const renderWidget = () =>
    render(
        <QueryClientProvider client={queryClient}>
            <FearGreedWidget />
        </QueryClientProvider>,
    );

const fillArcFlags = () => {
    const path = document.querySelector('.fg-arc-fill')?.getAttribute('d') ?? '';
    const match = path.match(/A \d+ \d+ 0 (\d) (\d)/);
    return { largeArc: match?.[1], sweep: match?.[2], path };
};

describe('the fear and greed gauge', () => {
    beforeEach(() => {
        queryClient.clear();
    });

    it('sweeps the short way round for a reading above the midpoint', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(indexResponse(73, 'Greed')),
        );

        renderWidget();
        expect(await screen.findByText('Greed', {}, { timeout: 10_000 })).toBeInTheDocument();

        const { largeArc, sweep } = fillArcFlags();
        expect(largeArc).toBe('0');
        expect(sweep).toBe('1');
    });

    it('keeps the arc in the upper half of the dial', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(indexResponse(90, 'Extreme Greed')),
        );

        renderWidget();
        expect(await screen.findByText('Extreme Greed', {}, { timeout: 10_000 })).toBeInTheDocument();

        const { path } = fillArcFlags();
        const endY = Number(path.trim().split(/\s+/).pop());
        expect(endY).toBeLessThan(72);
    });

    it('keeps the midpoint marker clear of the printed value', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(indexResponse(50, 'Neutral')),
        );

        renderWidget();
        expect(await screen.findByText('Neutral', {}, { timeout: 10_000 })).toBeInTheDocument();

        const marker = document.querySelector('.fg-marker');
        const markerX = Number(marker?.getAttribute('cx'));
        const markerY = Number(marker?.getAttribute('cy'));

        expect(markerX).toBeCloseTo(80, 1);
        expect(markerY).toBeCloseTo(18, 1);
        expect(document.querySelector('.fg-gauge-number')?.textContent).toBe('50');
        expect(document.querySelector('line')).toBeNull();
    });

    it('still renders a low reading', async () => {
        vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
            Promise.resolve(indexResponse(12, 'Extreme Fear')),
        );

        renderWidget();
        expect(await screen.findByText('Extreme Fear', {}, { timeout: 10_000 })).toBeInTheDocument();

        expect(fillArcFlags().largeArc).toBe('0');
    });
});
