import Skeleton from "../skeleton/Skeleton";

export default function MyArticleCardSkeleton() {
    return (
        <div className="my-article-card-skeleton" aria-hidden="true">
            <Skeleton className="my-article-card-skeleton__img" />
            <div className="my-article-card-skeleton__body">
                <Skeleton className="my-article-card-skeleton__category" />
                <Skeleton className="my-article-card-skeleton__title" />
                <Skeleton className="my-article-card-skeleton__summary" />
            </div>
            <div className="my-article-card-skeleton__actions">
                <Skeleton className="my-article-card-skeleton__btn" />
                <Skeleton className="my-article-card-skeleton__btn" />
            </div>
        </div>
    );
}
