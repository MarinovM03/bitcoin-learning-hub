import Skeleton from "../skeleton/Skeleton";

const GROUPS = [
    { cardCount: 3 },
    { cardCount: 3 },
    { cardCount: 2 },
];

export default function GlossaryTermSkeleton() {
    return (
        <div className="glossary-list" aria-hidden="true">
            {GROUPS.map((group, gi) => (
                <div key={gi} className="glossary-letter-group">
                    <Skeleton className="glossary-term-skeleton__heading" />
                    {Array.from({ length: group.cardCount }).map((_, ci) => (
                        <div key={ci} className="glossary-term-card glossary-term-skeleton__card">
                            <div className="glossary-term-header">
                                <div className="glossary-term-left">
                                    <Skeleton className="glossary-term-skeleton__name" />
                                    <Skeleton className="glossary-term-skeleton__category" />
                                </div>
                            </div>
                            <Skeleton className="glossary-term-skeleton__definition" />
                            <Skeleton className="glossary-term-skeleton__definition glossary-term-skeleton__definition--short" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
