import { Link, useSearchParams } from 'react-router';
import { Users, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { useFeedPage } from '../../hooks/queries/useFollows';
import ArticleCard from '../article-card/ArticleCard';
import ArticleCardSkeleton from '../article-card-skeleton/ArticleCardSkeleton';
import PageMeta from '../page-meta/PageMeta';
import { getPaginationPages } from '../../utils/pagination';

const ITEMS_PER_PAGE = 12;

export default function Feed() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

    const { data, isPending } = useFeedPage(page, ITEMS_PER_PAGE);

    const articles = data?.articles ?? [];
    const totalPages = data?.totalPages ?? 0;
    const followsNobody = !isPending && (data?.following ?? 0) === 0;

    const goToPage = (next: number) => {
        setSearchParams(params => {
            params.set('page', String(next));
            return params;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section id="feed-page" className="page-content">
            <PageMeta
                title="Your Feed"
                description="The latest from the authors and collections you follow."
                noindex
            />

            <div className="section-heading">
                <h2>
                    <Users size={20} strokeWidth={2} className="section-heading-icon" />
                    From People You Follow
                </h2>
                <div className="section-heading-line" />
                <Link to="/articles" className="section-heading-link">
                    All articles →
                </Link>
            </div>

            {isPending ? (
                <div className="catalog-grid">
                    {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
                </div>
            ) : followsNobody ? (
                <div className="following-empty">
                    <Compass size={30} strokeWidth={1.5} />
                    <p>You aren't following anyone yet.</p>
                    <Link to="/articles" className="following-empty-cta">Find authors →</Link>
                </div>
            ) : articles.length === 0 ? (
                <div className="following-empty">
                    <Compass size={30} strokeWidth={1.5} />
                    <p>Nothing new yet from the accounts and collections you follow.</p>
                    <Link to="/profile" className="following-empty-cta">Manage who you follow →</Link>
                </div>
            ) : (
                <>
                    <div className="catalog-grid">
                        {articles.map(article => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="catalog-pagination">
                            <button
                                className="catalog-page-btn catalog-page-btn--nav"
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 1}
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={16} strokeWidth={2.25} />
                                <span>Prev</span>
                            </button>

                            {getPaginationPages(page, totalPages).map((p, index) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${index}`} className="catalog-page-ellipsis">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`catalog-page-btn ${p === page ? 'catalog-page-btn--active' : ''}`}
                                        onClick={() => goToPage(p as number)}
                                        aria-label={`Page ${p}`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                className="catalog-page-btn catalog-page-btn--nav"
                                onClick={() => goToPage(page + 1)}
                                disabled={page === totalPages}
                                aria-label="Next page"
                            >
                                <span>Next</span>
                                <ChevronRight size={16} strokeWidth={2.25} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
