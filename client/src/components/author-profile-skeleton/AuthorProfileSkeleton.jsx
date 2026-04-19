import Skeleton from "../skeleton/Skeleton";
import ArticleCardSkeleton from "../article-card-skeleton/ArticleCardSkeleton";

export default function AuthorProfileSkeleton() {
    return (
        <section className="page-content author-profile-page" aria-hidden="true">
            <div className="author-profile-header">
                <Skeleton className="author-profile-skeleton__avatar" />
                <div className="author-profile-skeleton__info">
                    <Skeleton className="author-profile-skeleton__name" />
                    <Skeleton className="author-profile-skeleton__role" />
                    <div className="author-profile-skeleton__stats">
                        <div className="author-profile-skeleton__stat">
                            <Skeleton className="author-profile-skeleton__stat-value" />
                            <Skeleton className="author-profile-skeleton__stat-label" />
                        </div>
                        <div className="author-profile-skeleton__stat">
                            <Skeleton className="author-profile-skeleton__stat-value" />
                            <Skeleton className="author-profile-skeleton__stat-label" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="author-profile-articles">
                <div className="section-heading">
                    <Skeleton className="author-profile-skeleton__heading" />
                </div>
                <div className="catalog-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <ArticleCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
