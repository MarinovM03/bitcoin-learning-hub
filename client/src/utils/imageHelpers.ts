import type { SyntheticEvent } from 'react';

export const handleImgError = (e: SyntheticEvent<HTMLImageElement>): void => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = 'https://placehold.co/600x400/1a1a1a/F7931A?text=₿';
};
