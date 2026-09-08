import { Link, useSearchParams } from 'react-router';
import { Users, ChevronLeft, ChevronRight, Compass, ArrowRight } from 'lucide-react';
import { useFeedPage, useFollowing } from '../../hooks/queries/useFollows';
import ArticleCard from '../article-card/ArticleCard';
import ArticleCardSkeleton from '../article-card-skeleton/ArticleCardSkeleton';
import PageMeta from '../page-meta/PageMeta';
import { getPaginationPages } from '../../utils/pagination';
import { handleAvatarError, DEFAULT_AVATAR } from '../../utils/imageHelpers';

const ITEMS_PER_PAGE = 12;

export default function Feed() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const author = searchParams.get('author') || '';

    const { data: following } = useFollowing();
    const { data, isPending } = useFeedPage(page, ITEMS_PER_PAGE, author);

    const people = following?.users ?? [];
    const articles = data?.articles ?? [];
    const totalPages = data?.totalPages ?? 0;
    const followsNobody = !isPending && (data?.following ?? 0) === 0;
    const selected = people.find(person => person._id === author);

    const setParams = (next: { page?: number; author?: string | null }) => {
        setSearchParams(params => {
            if (next.author !== undefined) {
                if (next.author) params.set('author', next.author);
                else params.delete('author');
                params.delete('page');
            }
            if (next.page !== undefined) params.set('page', String(next.page));
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
                    All articles
                    <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
            </div>

            {people.length > 0 && (
                <div className="feed-rail" role="group" aria-label="Filter by author">
                    <button
                        type="button"
                        className={`feed-rail-item ${author === '' ? 'feed-rail-item--active' : ''}`}
                        onClick={() => setParams({ author: null })}
                        aria-pressed={author === ''}
                    >
                        <span className="feed-rail-all">
                            <Users size={20} strokeWidth={1.9} />
                        </span>
                        <span className="feed-rail-name">Everyone</span>
                    </button>

                    {people.map(person => (
                        <button
                            key={person._id}
                            type="button"
                            className={`feed-rail-item ${author === person._id ? 'feed-rail-item--active' : ''}`}
                            onClick={() => setParams({ author: person._id })}
                            aria-pressed={author === person._id}
                        >
                            <img
                                src={person.profilePicture || DEFAULT_AVATAR}
                                alt=""
                                className="feed-rail-avatar"
                                loading="lazy"
                                decoding="async"
                                onError={handleAvatarError}
                            />
                            <span className="feed-rail-name">{person.username}</span>
                        </button>
                    ))}
                </div>
            )}

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
                    <p>
                        {selected
                            ? `${selected.username} hasn't published anything yet.`
                            : 'Nothing new yet from the accounts and collections you follow.'}
                    </p>
                    {selected ? (
                        <button
                            type="button"
                            className="following-empty-cta"
                            onClick={() => setParams({ author: null })}
                        >
                            Show everyone →
                        </button>
                    ) : (
                        <Link to="/profile" className="following-empty-cta">Manage who you follow →</Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="catalog-grid">
                        {articles.map(article => (
                            <ArticleCard key={article._id} article={article} showAuthor />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="catalog-pagination">
                            <button
                                className="catalog-page-btn catalog-page-btn--nav"
                                onClick={() => setParams({ page: page - 1 })}
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
                                        onClick={() => setParams({ page: p as number })}
                                        aria-label={`Page ${p}`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                className="catalog-page-btn catalog-page-btn--nav"
                                onClick={() => setParams({ page: page + 1 })}
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
