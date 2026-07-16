export function formatViews(views: number | undefined | null): string {
    if (!views) return '0';
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views.toString();
}

const parseDate = (dateString: string | undefined | null): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
};

export function formatDate(dateString: string | undefined | null): string {
    const date = parseDate(dateString);
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateLong(dateString: string | undefined | null): string {
    const date = parseDate(dateString);
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(dateString: string | undefined | null): string {
    const date = parseDate(dateString);
    if (!date) return '—';
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(dateString: string): string {
    const date = parseDate(dateString);
    if (!date) return '—';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
}
