import Skeleton from "../skeleton/Skeleton";

export default function SearchResultSkeleton() {
    return (
        <div className="search-result-skeleton" aria-hidden="true">
            <Skeleton className="search-result-skeleton__title" />
            <Skeleton className="search-result-skeleton__summary" />
            <div className="search-result-skeleton__meta">
                <Skeleton className="search-result-skeleton__badge" />
                <Skeleton className="search-result-skeleton__badge" />
                <Skeleton className="search-result-skeleton__dim" />
            </div>
        </div>
    );
}
