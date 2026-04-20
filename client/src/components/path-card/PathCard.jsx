import { Link } from 'react-router';
import { Route, BookOpen, BadgeCheck } from 'lucide-react';
import { handleImgError } from '../../utils/imageHelpers';

const defaultCover = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=60';

export default function PathCard({ path, certification }) {
    const cover = path.coverImage || path.articles?.[0]?.imageUrl || defaultCover;
    const articleCount = Array.isArray(path.articles) ? path.articles.length : 0;
    const authorName = path._ownerId?.username;

    return (
        <Link to={`/paths/${path._id}`} className="path-card">
            <div className="path-card-img-wrap">
                <img
                    src={cover}
                    alt={path.title}
                    className="path-card-img"
                    onError={handleImgError}
                />
                <span className="path-card-overlay">
                    <Route size={14} strokeWidth={2.5} />
                    Learning Path
                </span>
                {path.difficulty && (
                    <span className={`path-card-difficulty path-card-difficulty--${path.difficulty.toLowerCase()}`}>
                        {path.difficulty}
                    </span>
                )}
                {certification && (
                    <span
                        className="path-card-certified"
                        title={`Passed with ${certification.score}%`}
                    >
                        <BadgeCheck size={13} strokeWidth={2.5} />
                        Certified · {certification.score}%
                    </span>
                )}
            </div>
            <div className="path-card-body">
                <h3 className="path-card-title">{path.title}</h3>
                <p className="path-card-description">{path.description}</p>
                <div className="path-card-footer">
                    <span className="path-card-meta">
                        <BookOpen size={13} strokeWidth={2.25} />
                        {articleCount} article{articleCount === 1 ? '' : 's'}
                    </span>
                    {authorName && (
                        <span className="path-card-author">by @{authorName}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
