import Skeleton from "../skeleton/Skeleton";

export default function PathDetailsSkeleton() {
    return (
        <section id="path-details-page" className="page-content" aria-hidden="true">
            <div className="path-details-page">
                <div className="path-details-header">
                    <Skeleton className="path-details-skeleton__kicker" />
                    <Skeleton className="path-details-skeleton__title" />
                    <div className="path-details-skeleton__description">
                        <Skeleton className="path-details-skeleton__line" />
                        <Skeleton className="path-details-skeleton__line path-details-skeleton__line--short" />
                    </div>
                    <div className="path-details-skeleton__meta-row">
                        <Skeleton className="path-details-skeleton__chip" />
                        <Skeleton className="path-details-skeleton__chip path-details-skeleton__chip--sm" />
                        <Skeleton className="path-details-skeleton__author-chip" />
                    </div>
                    <div className="path-details-skeleton__progress">
                        <div className="path-details-skeleton__progress-head">
                            <Skeleton className="path-details-skeleton__line path-details-skeleton__line--xs" />
                            <Skeleton className="path-details-skeleton__line path-details-skeleton__line--xxs" />
                        </div>
                        <Skeleton className="path-details-skeleton__progress-bar" />
                    </div>
                </div>

                <div className="path-details-articles">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="path-details-skeleton__row">
                            <Skeleton className="path-details-skeleton__index" />
                            <Skeleton className="path-details-skeleton__row-img" />
                            <div className="path-details-skeleton__row-body">
                                <Skeleton className="path-details-skeleton__line path-details-skeleton__line--row-title" />
                                <Skeleton className="path-details-skeleton__line path-details-skeleton__line--row-summary" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
