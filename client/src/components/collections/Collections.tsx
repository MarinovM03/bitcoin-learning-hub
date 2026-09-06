import { Link } from 'react-router';
import { Layers, ArrowRight } from 'lucide-react';
import { useCollections } from '../../hooks/queries/useCollections';
import PageMeta from '../page-meta/PageMeta';
import Skeleton from '../skeleton/Skeleton';
import { handleImgError } from '../../utils/imageHelpers';

export default function Collections() {
    const { data: collections = [], isPending } = useCollections();

    return (
        <section id="collections-page" className="page-content">
            <PageMeta
                title="Collections"
                description="Multi-part Bitcoin guides, gathered into ordered reading paths."
            />

            <div className="collections-page">
                <header className="collections-header">
                    <span className="collections-kicker">
                        <Layers size={14} strokeWidth={2.5} />
                        Reading Paths
                    </span>
                    <h1>Collections</h1>
                    <p className="collections-subtitle">
                        Multi-part guides, ordered so you can read them start to finish.
                    </p>
                </header>

                {isPending ? (
                    <div className="collections-grid">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="collection-card">
                                <Skeleton className="collection-card-img" />
                                <div className="collection-card-body">
                                    <Skeleton className="collection-card-line" />
                                    <Skeleton className="collection-card-line collection-card-line--short" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : collections.length === 0 ? (
                    <div className="collections-empty">
                        <div className="collections-empty-icon">
                            <Layers size={40} strokeWidth={1.6} />
                        </div>
                        <h3>No collections yet</h3>
                        <p>Once an author groups their articles into a guide, it appears here.</p>
                        <Link to="/articles" className="btn-submit collections-cta">
                            Browse Articles
                        </Link>
                    </div>
                ) : (
                    <div className="collections-grid">
                        {collections.map(collection => (
                            <Link
                                key={collection._id}
                                to={`/collections/${collection.slug}`}
                                className="collection-card"
                            >
                                <div className="collection-card-media">
                                    {collection.coverImage ? (
                                        <img
                                            src={collection.coverImage}
                                            alt=""
                                            className="collection-card-img"
                                            loading="lazy"
                                            decoding="async"
                                            onError={handleImgError}
                                        />
                                    ) : (
                                        <div className="collection-card-img collection-card-img--blank" />
                                    )}
                                    <span className="collection-card-count">
                                        {collection.articleCount} {collection.articleCount === 1 ? 'part' : 'parts'}
                                    </span>
                                </div>

                                <div className="collection-card-body">
                                    <h2 className="collection-card-title">{collection.title}</h2>
                                    {collection.description && (
                                        <p className="collection-card-desc">{collection.description}</p>
                                    )}
                                    <span className="collection-card-meta">
                                        {collection._ownerId?.username && `by ${collection._ownerId.username}`}
                                    </span>
                                    <span className="collection-card-cta">
                                        Start reading <ArrowRight size={14} strokeWidth={2.25} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
