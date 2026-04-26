import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { PenLine } from "lucide-react";
import * as likeService from "../../services/likeService";
import ConfirmModal from "../common/ConfirmModal";
import Spinner from "../spinner/Spinner";
import MyArticlesRail from "../my-articles-rail/MyArticlesRail";
import PageMeta from "../page-meta/PageMeta";
import { useMyArticles } from "../../hooks/queries/useArticles";
import { useDeleteArticle } from "../../hooks/mutations/useArticleMutations";

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/600x400/1a1a1a/F7931A?text=₿';
};

export default function MyArticles() {
    const { data: myArticles = [], isPending: isLoading } = useMyArticles();
    const deleteArticle = useDeleteArticle();

    const [activeTab, setActiveTab] = useState('published');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [totalLikes, setTotalLikes] = useState(0);
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortMode, setSortMode] = useState('newest');

    useEffect(() => {
        const published = myArticles.filter(a => a.status === 'published');
        if (published.length === 0) {
            setTotalLikes(0);
            return;
        }
        let cancelled = false;
        Promise.all(
            published.map(a =>
                likeService.getAllForArticle(a._id).then(likes => likes.length).catch(() => 0)
            )
        ).then(counts => {
            if (!cancelled) setTotalLikes(counts.reduce((sum, n) => sum + n, 0));
        });
        return () => { cancelled = true; };
    }, [myArticles]);

    const confirmDelete = async () => {
        try {
            await deleteArticle.mutateAsync(deleteTarget.id);
        } catch (err) {
            console.log("Delete failed:", err.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    const publishedArticles = myArticles.filter(a => a.status === 'published');
    const draftArticles = myArticles.filter(a => a.status === 'draft');
    const tabArticles = activeTab === 'published' ? publishedArticles : draftArticles;

    const availableCategories = useMemo(() => {
        const set = new Set(tabArticles.map(a => a.category).filter(Boolean));
        return Array.from(set).sort();
    }, [tabArticles]);

    useEffect(() => {
        if (activeCategory !== 'All' && !availableCategories.includes(activeCategory)) {
            setActiveCategory('All');
        }
    }, [activeCategory, availableCategories]);

    const totalViews = useMemo(
        () => publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0),
        [publishedArticles]
    );

    const articles = useMemo(() => {
        const filtered = activeCategory === 'All'
            ? tabArticles
            : tabArticles.filter(a => a.category === activeCategory);
        const sorted = [...filtered];
        if (sortMode === 'views') {
            sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else {
            sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        return sorted;
    }, [tabArticles, activeCategory, sortMode]);

    return (
        <section id="my-articles-page" className="page-content">
            <PageMeta title="My Articles" description="Manage your published articles and drafts." />
            {deleteTarget && (
                <ConfirmModal
                    title="Delete Article?"
                    message={`You are about to delete "${deleteTarget.title}".`}
                    subMessage="This will permanently remove the article and cannot be undone."
                    confirmLabel="Delete Article"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="my-articles-page">
                <div className="my-articles-main">
                    <div className="my-articles-page-header">
                        <div>
                            <h1>My Articles</h1>
                            <p className="my-articles-page-subtitle">
                                Manage your published work and drafts.
                            </p>
                        </div>
                        <Link to="/articles/create" className="btn-submit my-articles-write-btn">
                            <PenLine size={15} strokeWidth={2.25} />
                            Write New Article
                        </Link>
                    </div>

                    <div className="my-articles-page-tabs">
                        <button
                            className={`my-articles-page-tab ${activeTab === 'published' ? 'my-articles-page-tab--active' : ''}`}
                            onClick={() => setActiveTab('published')}
                        >
                            Published
                            <span className="my-articles-page-tab-count">{publishedArticles.length}</span>
                        </button>
                        <button
                            className={`my-articles-page-tab ${activeTab === 'draft' ? 'my-articles-page-tab--active' : ''}`}
                            onClick={() => setActiveTab('draft')}
                        >
                            Drafts
                            <span className="my-articles-page-tab-count">{draftArticles.length}</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <div className="my-articles-page-grid">
                            {articles.length === 0 ? (
                                <div className="my-articles-page-empty">
                                    {activeTab === 'published' ? (
                                        <>
                                            <p>You haven't published any articles yet.</p>
                                            <Link to="/articles/create" className="btn-submit my-articles-cta">
                                                Write Your First Article
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <p>You have no saved drafts.</p>
                                            <Link to="/articles/create" className="btn-submit my-articles-cta">
                                                Start Writing
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ) : (
                                articles.map(article => (
                                    <div key={article._id} className="my-articles-page-card">
                                        <div className="my-articles-page-card-img-wrap">
                                            <img
                                                src={article.imageUrl}
                                                alt={article.title}
                                                className="my-articles-page-card-img"
                                                onError={handleImgError}
                                            />
                                            <span className="my-articles-page-card-category">{article.category}</span>
                                            {activeTab === 'draft' && (
                                                <span className="my-articles-page-card-draft-badge">Draft</span>
                                            )}
                                        </div>
                                        <div className="my-articles-page-card-body">
                                            <h3 className="my-articles-page-card-title">{article.title}</h3>
                                            <p className="my-articles-page-card-summary">{article.summary}</p>
                                            <div className="my-articles-page-card-footer">
                                                {activeTab === 'published' && (
                                                    <Link
                                                        to={`/articles/${article._id}/details`}
                                                        className="my-articles-page-btn my-articles-page-btn--view"
                                                    >
                                                        View
                                                    </Link>
                                                )}
                                                <Link
                                                    to={`/articles/${article._id}/edit`}
                                                    className="my-articles-page-btn my-articles-page-btn--edit"
                                                >
                                                    {activeTab === 'draft' ? 'Edit & Publish' : 'Edit'}
                                                </Link>
                                                <button
                                                    className="my-articles-page-btn my-articles-page-btn--delete"
                                                    onClick={() => setDeleteTarget({ id: article._id, title: article.title })}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <MyArticlesRail
                    publishedCount={publishedArticles.length}
                    draftCount={draftArticles.length}
                    totalViews={totalViews}
                    totalLikes={totalLikes}
                    categories={availableCategories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    sortMode={sortMode}
                    onSortChange={setSortMode}
                />
            </div>
        </section>
    );
}