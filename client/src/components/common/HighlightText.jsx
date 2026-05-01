const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function HighlightText({ text, query, className }) {
    if (!text) return null;
    const trimmed = (query || '').trim();
    if (trimmed.length < 2) {
        return <span className={className}>{text}</span>;
    }

    // Split with a capture group → odd indices are matches, even are surrounding text
    const pattern = new RegExp(`(${escapeRegex(trimmed)})`, 'ig');
    const parts = String(text).split(pattern);

    return (
        <span className={className}>
            {parts.map((part, i) => (
                i % 2 === 1
                    ? <mark key={i} className="search-highlight">{part}</mark>
                    : <span key={i}>{part}</span>
            ))}
        </span>
    );
}
