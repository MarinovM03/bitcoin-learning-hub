import Skeleton from "../skeleton/Skeleton";

export default function PathCardSkeleton() {
    return (
        <div className="path-card path-card-skeleton" aria-hidden="true">
            <div className="path-card-img-wrap">
                <Skeleton className="path-card-skeleton__img" />
            </div>
            <div className="path-card-body">
                <Skeleton className="path-card-skeleton__title" />
                <Skeleton className="path-card-skeleton__description" />
                <Skeleton className="path-card-skeleton__description path-card-skeleton__description--short" />
                <div className="path-card-skeleton__footer">
                    <Skeleton className="path-card-skeleton__meta" />
                    <Skeleton className="path-card-skeleton__author" />
                </div>
            </div>
        </div>
    );
}
