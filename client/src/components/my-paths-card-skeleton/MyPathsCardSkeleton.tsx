import Skeleton from "../skeleton/Skeleton";

export default function MyPathsCardSkeleton() {
    return (
        <div className="my-paths-card my-paths-card-skeleton" aria-hidden="true">
            <div className="my-paths-card-img-wrap">
                <Skeleton className="my-paths-card-skeleton__img" />
            </div>
            <div className="my-paths-card-body">
                <Skeleton className="my-paths-card-skeleton__title" />
                <Skeleton className="my-paths-card-skeleton__description" />
                <Skeleton className="my-paths-card-skeleton__description my-paths-card-skeleton__description--short" />
                <Skeleton className="my-paths-card-skeleton__meta" />
                <div className="my-paths-card-skeleton__footer">
                    <Skeleton className="my-paths-card-skeleton__btn" />
                    <Skeleton className="my-paths-card-skeleton__btn" />
                    <Skeleton className="my-paths-card-skeleton__btn" />
                </div>
            </div>
        </div>
    );
}
