import { Link, useParams } from 'react-router';
import { Layers, ArrowLeft, ChevronRight } from 'lucide-react';
import { useCollection } from '../../hooks/queries/useCollections';
import { useAuth } from '../../contexts/AuthContext';
import ArticleCardSkeleton from '../article-card-skeleton/ArticleCardSkeleton';
import { handleImgError } from '../../utils/imageHelpers';
import NotFound from '../not-found/NotFound';
import PageMeta from '../page-meta/PageMeta';

export default function CollectionDetails() {
    const { slug } = useParams();
    const { userId } = useAuth();
    const { data: collection, isPending, isError } = useCollection(slug);

    if (isError) return <NotFound />;

    if (isPending || !collection) {
        return (
            <section className="page-content">
                <div className="collection-details">
                    <div className="catalog-grid">
                        {Array.from({ length: 3 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
                    </div>
                </div>
            </section>
        );
    }

    const isOwner = userId && String(collection._ownerId?._id) === String(userId);

    return (
        <section id="collection-details-page" className="page-content">
            <PageMeta
                title={collection.title}
                description={collection.description || `A ${collection.articles.length}-part Bitcoin guide.`}
                image={collection.coverImage}
            />

            <div className="collection-details">
                <Link to="/collections" className="collection-back">
                    <ArrowLeft size={14} strokeWidth={2.25} />
                    All collections
                </Link>

                <header className="collection-hero">
                    <span className="collections-kicker">
                        <Layers size={14} strokeWidth={2.5} />
                        {collection.articles.length} {collection.articles.length === 1 ? 'part' : 'parts'}
                    </span>
                    <h1>{collection.title}</h1>
                    {collection.description && (
                        <p className="collection-hero-desc">{collection.description}</p>
                    )}
                    {collection._ownerId && (
                        <p className="collection-hero-owner">
                            Curated by{' '}
                            <Link to={`/users/${collection._ownerId._id}`}>
                                {collection._ownerId.username}
                            </Link>
                        </p>
                    )}
                    {isOwner && (
                        <Link to="/my-collections" className="collection-manage-link">
                            Manage this collection
                        </Link>
                    )}
                </header>

                {collection.articles.length === 0 ? (
                    <p className="collections-empty-note">
                        This collection has no published articles yet.
                    </p>
                ) : (
                    <ol className="collection-parts">
                        {collection.articles.map((article, index) => (
                            <li key={article._id}>
                                <Link
                                    to={`/articles/${article._id}/details`}
                                    className="collection-part"
                                >
                                    <span className="collection-part-number">{index + 1}</span>
                                    <img
                                        src={article.imageUrl}
                                        alt=""
                                        className="collection-part-thumb"
                                        loading="lazy"
                                        decoding="async"
                                        onError={handleImgError}
                                    />
                                    <span className="collection-part-body">
                                        <span className="collection-part-title">{article.title}</span>
                                        <span className="collection-part-summary">{article.summary}</span>
                                        <span className="collection-part-meta">
                                            {article.category}
                                            {article.readingTime ? ` · ${article.readingTime} min read` : ''}
                                            {article.status !== 'published' ? ' · draft' : ''}
                                        </span>
                                    </span>
                                    <ChevronRight size={18} strokeWidth={2.25} className="collection-part-chevron" />
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}
