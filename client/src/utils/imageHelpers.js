export const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/600x400/1a1a1a/F7931A?text=₿';
};