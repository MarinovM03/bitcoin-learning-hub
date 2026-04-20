import Skeleton from "../skeleton/Skeleton";

export default function CertificationCardSkeleton() {
    return (
        <div className="certification-card certification-card-skeleton" aria-hidden="true">
            <div className="certification-card-cover">
                <Skeleton className="certification-card-skeleton__cover" />
                <Skeleton className="certification-card-skeleton__score" />
            </div>
            <div className="certification-card-body">
                <Skeleton className="certification-card-skeleton__badge" />
                <Skeleton className="certification-card-skeleton__title" />
                <Skeleton className="certification-card-skeleton__title certification-card-skeleton__title--short" />
                <div className="certification-card-skeleton__meta">
                    <Skeleton className="certification-card-skeleton__meta-item" />
                    <Skeleton className="certification-card-skeleton__meta-item certification-card-skeleton__meta-item--short" />
                </div>
            </div>
        </div>
    );
}
