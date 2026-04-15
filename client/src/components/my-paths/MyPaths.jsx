import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, Route, BookOpen, Pencil, Trash2, Eye } from "lucide-react";
import * as learningPathService from "../../services/learningPathService";
import { useAuth } from "../../contexts/AuthContext";
import { handleImgError } from "../../utils/imageHelpers";
import ConfirmModal from "../common/ConfirmModal";
import Spinner from "../spinner/Spinner";

const defaultCover = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=60';

export default function MyPaths() {
    const { userId } = useAuth();

    const [myPaths, setMyPaths] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [activeDifficulty, setActiveDifficulty] = useState('All');
    const [sortMode, setSortMode] = useState('newest');

    useEffect(() => {
        learningPathService.getMyPaths()
            .then(result => {
                const list = Array.isArray(result) ? result : (result?.paths || []);
                setMyPaths(list);
                setError('');
            })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [userId]);

    const availableDifficulties = useMemo(() => {
        const set = new Set(myPaths.map(p => p.difficulty).filter(Boolean));
        return Array.from(set).sort();
    }, [myPaths]);

    useEffect(() => {
        if (activeDifficulty !== 'All' && !availableDifficulties.includes(activeDifficulty)) {
            setActiveDifficulty('All');
        }
    }, [activeDifficulty, availableDifficulties]);

    const totalArticles = useMemo(
        () => myPaths.reduce((sum, p) => sum + (Array.isArray(p.articles) ? p.articles.length : 0), 0),
        [myPaths]
    );

    const visiblePaths = useMemo(() => {
        const filtered = activeDifficulty === 'All'
            ? myPaths
            : myPaths.filter(p => p.difficulty === activeDifficulty);
        const sorted = [...filtered];
        if (sortMode === 'articles') {
            sorted.sort((a, b) => (b.articles?.length || 0) - (a.articles?.length || 0));
        } else {
            sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }
        return sorted;
    }, [myPaths, activeDifficulty, sortMode]);

    const confirmDelete = async () => {
        try {
            await learningPathService.remove(deleteTarget.id);
            setMyPaths(prev => prev.filter(p => p._id !== deleteTarget.id));
        } catch (err) {
            console.log("Delete failed:", err.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <section id="my-paths-page" className="page-content">
            {deleteTarget && (
                <ConfirmModal
                    title="Delete Learning Path?"
                    message={`You are about to delete "${deleteTarget.title}".`}
                    subMessage="This will permanently remove the path. Articles inside it remain untouched."
                    confirmLabel="Delete Path"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="my-paths-page">
                <div className="my-paths-main">
                    <div className="my-paths-header">
                        <div>
                            <span className="my-paths-kicker">
                                <Route size={14} strokeWidth={2.5} />
                                Your Learning Paths
                            </span>
                            <h1>My Paths</h1>
                            <p className="my-paths-subtitle">
                                Manage the learning journeys you've curated.
                            </p>
                        </div>
                        <Link to="/paths/create" className="my-paths-create-btn">
                            <Plus size={15} strokeWidth={2.25} />
                            Create Path
                        </Link>
                    </div>

                    {isLoading ? (
                        <Spinner />
                    ) : error ? (
                        <div className="my-paths-empty">
                            <p>{error}</p>
                        </div>
                    ) : myPaths.length === 0 ? (
                        <div className="my-paths-empty">
                            <Route size={40} strokeWidth={1.5} />
                            <p>You haven't created any learning paths yet.</p>
                            <Link to="/paths/create" className="my-paths-empty-cta">
                                Create Your First Path
                            </Link>
                        </div>
                    ) : (
                        <div className="my-paths-grid">
                            {visiblePaths.map(path => {
                                const cover = path.coverImage || path.articles?.[0]?.imageUrl || defaultCover;
                                const articleCount = Array.isArray(path.articles) ? path.articles.length : 0;
                                return (
                                    <div key={path._id} className="my-paths-card">
                                        <div className="my-paths-card-img-wrap">
                                            <img
                                                src={cover}
                                                alt={path.title}
                                                className="my-paths-card-img"
                                                onError={handleImgError}
                                            />
                                            {path.difficulty && (
                                                <span className={`my-paths-card-difficulty my-paths-card-difficulty--${path.difficulty.toLowerCase()}`}>
                                                    {path.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <div className="my-paths-card-body">
                                            <h3 className="my-paths-card-title">{path.title}</h3>
                                            <p className="my-paths-card-description">{path.description}</p>
                                            <div className="my-paths-card-meta">
                                                <BookOpen size={13} strokeWidth={2.25} />
                                                {articleCount} article{articleCount === 1 ? '' : 's'}
                                            </div>
                                            <div className="my-paths-card-footer">
                                                <Link
                                                    to={`/paths/${path._id}`}
                                                    className="my-paths-btn my-paths-btn--view"
                                                >
                                                    <Eye size={14} strokeWidth={2.25} />
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/paths/${path._id}/edit`}
                                                    className="my-paths-btn my-paths-btn--edit"
                                                >
                                                    <Pencil size={14} strokeWidth={2.25} />
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="my-paths-btn my-paths-btn--delete"
                                                    onClick={() => setDeleteTarget({ id: path._id, title: path.title })}
                                                >
                                                    <Trash2 size={14} strokeWidth={2.25} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <aside className="my-paths-rail">
                    <div className="my-paths-rail-card">
                        <h3 className="my-paths-rail-title">Overview</h3>
                        <div className="my-paths-rail-stat">
                            <span className="my-paths-rail-stat-label">Paths</span>
                            <span className="my-paths-rail-stat-value">{myPaths.length}</span>
                        </div>
                        <div className="my-paths-rail-stat">
                            <span className="my-paths-rail-stat-label">Total articles</span>
                            <span className="my-paths-rail-stat-value">{totalArticles}</span>
                        </div>
                    </div>

                    {availableDifficulties.length > 0 && (
                        <div className="my-paths-rail-card">
                            <h3 className="my-paths-rail-title">Difficulty</h3>
                            <div className="my-paths-rail-chips">
                                {['All', ...availableDifficulties].map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        className={`my-paths-rail-chip ${activeDifficulty === d ? 'my-paths-rail-chip--active' : ''}`}
                                        onClick={() => setActiveDifficulty(d)}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="my-paths-rail-card">
                        <h3 className="my-paths-rail-title">Sort</h3>
                        <div className="my-paths-rail-chips">
                            <button
                                type="button"
                                className={`my-paths-rail-chip ${sortMode === 'newest' ? 'my-paths-rail-chip--active' : ''}`}
                                onClick={() => setSortMode('newest')}
                            >
                                Newest
                            </button>
                            <button
                                type="button"
                                className={`my-paths-rail-chip ${sortMode === 'articles' ? 'my-paths-rail-chip--active' : ''}`}
                                onClick={() => setSortMode('articles')}
                            >
                                Most articles
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
