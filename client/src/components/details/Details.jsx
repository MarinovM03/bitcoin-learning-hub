import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import * as articleService from '../../services/articleService';
import * as likeService from '../../services/likeService';
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../spinner/Spinner";

export default function Details() {
    const navigate = useNavigate();
    const { articleId } = useParams();
    const { userId, isAuthenticated } = useAuth();

    const [article, setArticle] = useState({});
    const [totalLikes, setTotalLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            articleService.getOne(articleId),
            likeService.getAllForArticle(articleId)
        ])
        .then(([articleData, likesArray]) => {
            setArticle(articleData);
            setTotalLikes(likesArray.length);
            
            if (userId) {
                const isLiked = likesArray.some(like => like._ownerId === userId);
                setHasLiked(isLiked);
            }
        })
        .catch(() => navigate('/404'))
        .finally(() => setIsLoading(false));
    }, [articleId, userId, navigate]);

    const isOwner = userId && article._ownerId && userId === article._ownerId;

    const onDelete = async () => {
        const confirmed = confirm(`Are you sure you want to delete: ${article.title}?`);

        if (confirmed) {
            try {
                await articleService.remove(articleId);
                navigate('/articles');
            } catch (err) {
                console.log("Delete failed:", err.message);
                alert("Failed to delete article. Please try again.");
            }
        }
    };

    const onLike = async () => {
        if (hasLiked) return;

        try {
            await likeService.like(articleId);
            setTotalLikes(state => state + 1);
            setHasLiked(true);
        } catch (err) {
            console.log("Like failed", err);
        }
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <section id="details-page" className="page-content">
             <div className="details-page">
                <div className="details-hero">
                    <img className="details-img" src={article?.imageUrl} alt={article?.title} />
                </div>
                <div className="details-container">
                    <div className="details-header">
                        <h1>{article?.title} <span className="likes-counter">({totalLikes} likes)</span></h1>
                        <span className="category-tag">{article?.category}</span>
                    </div>
                    <p className="details-summary">{article?.summary}</p>
                    <p className="details-content">{article?.content}</p>

                    <div className="details-buttons">
                        {isOwner && (
                            <>
                                <Link to={`/articles/${articleId}/edit`} className="btn-edit">Edit</Link>
                                <button className="btn-delete" onClick={onDelete}>Delete</button>
                            </>
                        )}
                        {isAuthenticated && !isOwner && !hasLiked && (
                            <button className="btn-like" onClick={onLike}>Like Article</button>
                        )}
                        {hasLiked && <span className="liked-text">You have already liked this article!</span>}
                    </div>
                </div>
            </div>
        </section>
    );
}