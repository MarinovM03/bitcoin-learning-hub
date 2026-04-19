import Skeleton from "../skeleton/Skeleton";

export default function ArticleDetailsSkeleton() {
    return (
        <section id="details-page" className="page-content" aria-hidden="true">
            <div className="details-page">
                <div className="details-hero">
                    <Skeleton className="article-details-skeleton__hero-img" />
                    <div className="details-hero-overlay" />
                    <div className="details-hero-meta">
                        <Skeleton className="article-details-skeleton__hero-title" />
                    </div>
                </div>

                <div className="details-body">
                    <div className="details-main">
                        <div className="article-details-skeleton__meta-row">
                            <Skeleton className="article-details-skeleton__chip" />
                            <Skeleton className="article-details-skeleton__chip" />
                            <Skeleton className="article-details-skeleton__chip article-details-skeleton__chip--sm" />
                            <Skeleton className="article-details-skeleton__chip article-details-skeleton__chip--sm" />
                        </div>

                        <div className="article-details-skeleton__summary">
                            <Skeleton className="article-details-skeleton__line" />
                            <Skeleton className="article-details-skeleton__line article-details-skeleton__line--short" />
                        </div>

                        <div className="article-details-skeleton__content">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className={`article-details-skeleton__line ${i % 4 === 3 ? 'article-details-skeleton__line--short' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="details-sidebar">
                        <div className="article-details-skeleton__panel">
                            <Skeleton className="article-details-skeleton__panel-title" />
                            <div className="article-details-skeleton__author-row">
                                <Skeleton className="article-details-skeleton__avatar" />
                                <div className="article-details-skeleton__author-info">
                                    <Skeleton className="article-details-skeleton__line article-details-skeleton__line--sm" />
                                    <Skeleton className="article-details-skeleton__line article-details-skeleton__line--xs" />
                                </div>
                            </div>
                        </div>

                        <div className="article-details-skeleton__panel">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="article-details-skeleton__info-row">
                                    <Skeleton className="article-details-skeleton__line article-details-skeleton__line--xs" />
                                    <Skeleton className="article-details-skeleton__line article-details-skeleton__line--xxs" />
                                </div>
                            ))}
                        </div>

                        <div className="article-details-skeleton__panel">
                            <Skeleton className="article-details-skeleton__panel-title" />
                            <div className="article-details-skeleton__share-row">
                                <Skeleton className="article-details-skeleton__share-btn" />
                                <Skeleton className="article-details-skeleton__share-btn" />
                                <Skeleton className="article-details-skeleton__share-btn" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
