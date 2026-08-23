import { useEffect } from 'react';

export function useScrollLock(active = true) {
    useEffect(() => {
        if (!active) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [active]);
}
