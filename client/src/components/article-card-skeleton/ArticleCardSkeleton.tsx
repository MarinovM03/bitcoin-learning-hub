import Skeleton from "../skeleton/Skeleton";

export default function ArticleCardSkeleton() {
    return (
        <div className="article-card-skeleton" aria-hidden="true">
            <Skeleton className="article-card-skeleton__img" />
            <div className="article-card-skeleton__body">
                <Skeleton className="article-card-skeleton__title" />
                <Skeleton className="article-card-skeleton__title article-card-skeleton__title--short" />
                <Skeleton className="article-card-skeleton__summary" />
                <Skeleton className="article-card-skeleton__summary" />
                <div className="article-card-skeleton__footer">
                    <Skeleton className="article-card-skeleton__meta" />
                    <Skeleton className="article-card-skeleton__meta" />
                    <Skeleton className="article-card-skeleton__meta article-card-skeleton__meta--wide" />
                </div>
            </div>
        </div>
    );
}
