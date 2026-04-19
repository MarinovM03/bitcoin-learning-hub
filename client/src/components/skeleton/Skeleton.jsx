export default function Skeleton({ className = '' }) {
    return <div className={`skeleton ${className}`} aria-hidden="true" />;
}
