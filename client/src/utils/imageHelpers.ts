import type { SyntheticEvent } from 'react';
import defaultAvatarUrl from '../assets/images/default-avatar.svg';

export const DEFAULT_AVATAR = defaultAvatarUrl;

export const handleImgError = (e: SyntheticEvent<HTMLImageElement>): void => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = 'https://placehold.co/600x400/1a1a1a/F7931A?text=₿';
};

export const handleAvatarError = (e: SyntheticEvent<HTMLImageElement>): void => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = DEFAULT_AVATAR;
};
