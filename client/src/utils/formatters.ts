export function formatViews(views: number | undefined | null): string {
    if (!views) return '0';
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views.toString();
}
