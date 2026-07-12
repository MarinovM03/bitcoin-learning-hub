import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap<T extends HTMLElement>(active = true, onEscape?: () => void) {
    const containerRef = useRef<T>(null);
    const onEscapeRef = useRef(onEscape);
    onEscapeRef.current = onEscape;

    useEffect(() => {
        if (!active) return;
        const container = containerRef.current;
        if (!container) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;

        const getFocusable = () =>
            Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
                .filter((el) => el.offsetParent !== null || el === document.activeElement);

        if (!container.contains(document.activeElement)) {
            getFocusable()[0]?.focus();
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onEscapeRef.current) {
                onEscapeRef.current();
                return;
            }
            if (e.key !== 'Tab') return;

            const items = getFocusable();
            if (items.length === 0) return;
            const first = items[0]!;
            const last = items[items.length - 1]!;
            const current = document.activeElement;

            if (e.shiftKey) {
                if (current === first || !container.contains(current)) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (current === last || !container.contains(current)) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [active]);

    return containerRef;
}
