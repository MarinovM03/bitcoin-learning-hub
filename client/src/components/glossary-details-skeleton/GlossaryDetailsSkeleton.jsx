import Skeleton from "../skeleton/Skeleton";

export default function GlossaryDetailsSkeleton() {
    return (
        <section className="page-content" aria-hidden="true">
            <div className="glossary-details">
                <div className="glossary-details-skeleton__chrome">
                    <Skeleton className="glossary-details-skeleton__back" />
                </div>

                <div className="glossary-details-hero glossary-details-skeleton__hero">
                    <Skeleton className="glossary-details-skeleton__mark" />
                    <div className="glossary-details-skeleton__hero-text">
                        <Skeleton className="glossary-details-skeleton__category" />
                        <Skeleton className="glossary-details-skeleton__title" />
                        <div className="glossary-details-skeleton__meta">
                            <Skeleton className="glossary-details-skeleton__meta-item" />
                            <Skeleton className="glossary-details-skeleton__meta-item" />
                        </div>
                    </div>
                </div>

                <div className="glossary-details-skeleton__quote-card">
                    <Skeleton className="glossary-details-skeleton__quote-label" />
                    <Skeleton className="glossary-details-skeleton__line" />
                    <Skeleton className="glossary-details-skeleton__line glossary-details-skeleton__line--short" />
                </div>

                <div className="glossary-details-skeleton__body-card">
                    <Skeleton className="glossary-details-skeleton__section-title" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className={`glossary-details-skeleton__line ${i === 5 ? 'glossary-details-skeleton__line--short' : ''}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
