import { FileText, Pencil, Eye, Heart, Clock, TrendingUp } from "lucide-react";

export default function MyArticlesRail({
    publishedCount,
    draftCount,
    totalViews,
    totalLikes,
    categories,
    activeCategory,
    onCategoryChange,
    sortMode,
    onSortChange,
}) {
    const stats = [
        { Icon: FileText, label: 'Published', value: publishedCount },
        { Icon: Pencil,   label: 'Drafts',    value: draftCount },
        { Icon: Eye,      label: 'Views',     value: totalViews },
        { Icon: Heart,    label: 'Likes',     value: totalLikes },
    ];

    return (
        <aside className="my-articles-rail" aria-label="Dashboard filters">
            <div className="my-articles-rail-section">
                <span className="my-articles-rail-title">Overview</span>
                <div className="my-articles-rail-stats">
                    {stats.map(({ Icon, label, value }) => (
                        <div key={label} className="my-articles-rail-stat">
                            <Icon size={14} strokeWidth={2.25} />
                            <div className="my-articles-rail-stat-body">
                                <span className="my-articles-rail-stat-value">{value}</span>
                                <span className="my-articles-rail-stat-label">{label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="my-articles-rail-divider" />

            <div className="my-articles-rail-section">
                <span className="my-articles-rail-title">Category</span>
                <div className="my-articles-rail-pills">
                    <button
                        type="button"
                        className={`my-articles-rail-pill ${activeCategory === 'All' ? 'my-articles-rail-pill--active' : ''}`}
                        onClick={() => onCategoryChange('All')}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`my-articles-rail-pill ${activeCategory === cat ? 'my-articles-rail-pill--active' : ''}`}
                            onClick={() => onCategoryChange(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                    {categories.length === 0 && (
                        <span className="my-articles-rail-empty">No categories yet.</span>
                    )}
                </div>
            </div>

            <div className="my-articles-rail-divider" />

            <div className="my-articles-rail-section">
                <span className="my-articles-rail-title">Sort</span>
                <div className="my-articles-rail-sort">
                    <button
                        type="button"
                        className={`my-articles-rail-sort-btn ${sortMode === 'newest' ? 'my-articles-rail-sort-btn--active' : ''}`}
                        onClick={() => onSortChange('newest')}
                    >
                        <Clock size={13} strokeWidth={2.25} />
                        <span>Newest</span>
                    </button>
                    <button
                        type="button"
                        className={`my-articles-rail-sort-btn ${sortMode === 'views' ? 'my-articles-rail-sort-btn--active' : ''}`}
                        onClick={() => onSortChange('views')}
                    >
                        <TrendingUp size={13} strokeWidth={2.25} />
                        <span>Most viewed</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
