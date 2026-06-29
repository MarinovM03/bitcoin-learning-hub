import Skeleton from "../skeleton/Skeleton";

export default function HomeLatestSkeleton() {
    return (
        <div className="magazine-grid" aria-hidden="true">
            <div className="home-latest-skeleton__featured">
                <Skeleton className="home-latest-skeleton__featured-img" />
                <div className="home-latest-skeleton__featured-overlay">
                    <Skeleton className="home-latest-skeleton__tag" />
                    <Skeleton className="home-latest-skeleton__featured-title" />
                    <Skeleton className="home-latest-skeleton__featured-summary" />
                    <Skeleton className="home-latest-skeleton__read-more" />
                </div>
            </div>

            <div className="magazine-stack">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="home-latest-skeleton__small">
                        <Skeleton className="home-latest-skeleton__small-img" />
                        <div className="home-latest-skeleton__small-body">
                            <Skeleton className="home-latest-skeleton__tag" />
                            <Skeleton className="home-latest-skeleton__small-title" />
                            <Skeleton className="home-latest-skeleton__small-summary" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
