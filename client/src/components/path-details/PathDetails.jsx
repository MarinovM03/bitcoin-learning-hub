import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PenLine, Trash2, CheckCircle2, Circle, Route, Clock } from 'lucide-react';
import * as learningPathService from '../../services/learningPathService';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../spinner/Spinner';
import ConfirmModal from '../common/ConfirmModal';
import { handleImgError } from '../../utils/imageHelpers';

const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

export default function PathDetails() {
    const { pathId } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuth();

    const [path, setPath] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        learningPathService.getOne(pathId)
            .then(result => setPath(result))
            .catch(() => navigate('/not-found'))
            .finally(() => setIsLoading(false));
    }, [pathId, navigate]);

    const confirmDelete = async () => {
        try {
            await learningPathService.remove(pathId);
            navigate('/paths');
        } catch {
            setShowDeleteModal(false);
        }
    };

    if (isLoading || !path) return <Spinner />;

    const isOwner = userId && path._ownerId?._id && userId === String(path._ownerId._id);
    const completedSet = new Set((path.progress?.completedIds || []).map(String));
    const completed = path.progress?.completed || 0;
    const total = path.progress?.total || path.articles.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <section id="path-details-page" className="page-content">
            {showDeleteModal && (
                <ConfirmModal
                    title="Delete Path?"
                    message={`You are about to delete "${path.title}".`}
                    subMessage="This will permanently remove the learning path. Articles themselves are not affected."
                    confirmLabel="Delete Path"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            <div className="path-details-page">
                <header className="path-details-header">
                    <div className="path-details-kicker">
                        <Route size={14} strokeWidth={2.5} />
                        Learning Path
                    </div>
                    <h1 className="path-details-title">{path.title}</h1>
                    <p className="path-details-description">{path.description}</p>

                    <div className="path-details-meta-row">
                        {path.difficulty && (
                            <span className={`difficulty-badge difficulty-badge--${path.difficulty.toLowerCase()}`}>
                                {path.difficulty}
                            </span>
                        )}
                        <span className="path-details-meta-item">{total} article{total === 1 ? '' : 's'}</span>
                        {path._ownerId && (
                            <Link to={`/users/${path._ownerId._id}`} className="path-details-author-chip">
                                <img
                                    src={path._ownerId.profilePicture || defaultAvatar}
                                    alt={path._ownerId.username}
                                    onError={handleImgError}
                                />
                                <span>@{path._ownerId.username}</span>
                            </Link>
                        )}
                    </div>

                    {total > 0 && (
                        <div className="path-progress">
                            <div className="path-progress-head">
                                <span className="path-progress-label">Progress</span>
                                <span className="path-progress-count">{completed} of {total} read</span>
                            </div>
                            <div className="path-progress-bar">
                                <div
                                    className="path-progress-bar-fill"
                                    style={{ '--progress': `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {isOwner && (
                        <div className="path-details-owner-actions">
                            <Link to={`/paths/${pathId}/edit`} className="btn-edit">
                                <PenLine size={15} strokeWidth={2.25} />
                                Edit Path
                            </Link>
                            <button className="btn-delete" onClick={() => setShowDeleteModal(true)}>
                                <Trash2 size={15} strokeWidth={2.25} />
                                Delete Path
                            </button>
                        </div>
                    )}
                </header>

                <div className="path-details-articles">
                    {path.articles.length === 0 ? (
                        <p className="path-details-empty">This path has no articles yet.</p>
                    ) : (
                        path.articles.map((article, index) => {
                            const isComplete = completedSet.has(String(article._id));
                            return (
                                <Link
                                    key={article._id}
                                    to={`/articles/${article._id}/details`}
                                    className={`path-article-row ${isComplete ? 'path-article-row--complete' : ''}`}
                                >
                                    <span className="path-article-index">{index + 1}</span>
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="path-article-img"
                                        onError={handleImgError}
                                    />
                                    <div className="path-article-body">
                                        <div className="path-article-meta">
                                            <span className="category-tag">{article.category}</span>
                                            {article.difficulty && (
                                                <span className={`difficulty-badge difficulty-badge--${article.difficulty.toLowerCase()}`}>
                                                    {article.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="path-article-title">{article.title}</h3>
                                        <p className="path-article-summary">{article.summary}</p>
                                        <div className="path-article-footer">
                                            <span className="path-article-reading">
                                                <Clock size={12} strokeWidth={2.25} />
                                                {article.readingTime ?? 1} min
                                            </span>
                                            {article._ownerId?.username && (
                                                <span className="path-article-author">by @{article._ownerId.username}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="path-article-status" aria-label={isComplete ? 'Completed' : 'Not read yet'}>
                                        {isComplete
                                            ? <CheckCircle2 size={22} strokeWidth={2} />
                                            : <Circle size={22} strokeWidth={2} />}
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
