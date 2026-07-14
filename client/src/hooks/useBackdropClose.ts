import { useRef } from 'react';
import type { MouseEvent } from 'react';

export function useBackdropClose(onClose: () => void) {
    const pressedOnBackdrop = useRef(false);

    const onMouseDown = (e: MouseEvent<HTMLElement>) => {
        pressedOnBackdrop.current = e.target === e.currentTarget;
    };

    const onClick = (e: MouseEvent<HTMLElement>) => {
        if (pressedOnBackdrop.current && e.target === e.currentTarget) {
            onClose();
        }
        pressedOnBackdrop.current = false;
    };

    return { onMouseDown, onClick };
}
