export function getReadingTime(content) {
    if (!content || typeof content !== 'string') return 1;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 250));
}