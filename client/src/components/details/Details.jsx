import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";

import * as articleService from '../../services/articleService';
import * as likeService from '../../services/likeService';

export default function Details({ auth }) {
    const navigate = useNavigate();
    const { articleId } = useParams();

    const [article, setArticle] = useState({});
    const [totalLikes, setTotalLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        const loadArticleDetails = async () => {
            // 1. Get Article Data
            const articleResult = await articleService.getOne(articleId);
            setArticle(articleResult);

            // 2. Get All Likes
            const likesArray = await likeService.getAllForArticle(articleId);
            
            // 3. Set Total Count
            setTotalLikes(likesArray.length);

            // 4. Check if CURRENT USER is in that list of likes
            if (auth._id) {
                // .some() returns true if it finds the user's ID in the array
                const isLiked = likesArray.some(like => like._ownerId === auth._id);
                setHasLiked(isLiked);
            }
        };

        loadArticleDetails();
    }, [articleId, auth._id]);

    const isOwner = auth._id === article._ownerId;

    const onDelete = async () => {
        const confirmed = confirm("Are you sure you want to delete this?");
        if (confirmed) {
            await articleService.del(articleId);
            navigate('/articles');
        }
    };

    const onLike = async () => {
        if (hasLiked) return;

        await likeService.like(articleId);
        
        // Update UI immediately
        setTotalLikes(state => state + 1);
        setHasLiked(true);
    };

    return (
        <section id="details-page" className="page-content">
            <div className="details-page">
                
                <div className="details-hero">
                    <img className="details-img" src={article.imageUrl} alt={article.title} />
                </div>

                <div className="details-container">
                    <div className="details-header">
                        <h1>
                            {article.title} 
                            <span className="likes-counter">({totalLikes} likes)</span>
                        </h1>
                        <span className="category-tag">{article.category}</span>
                    </div>

                    <p className="details-summary">{article.summary}</p>
                    
                    <p className="details-content">{article.content}</p>

                    <div className="details-buttons">
                        {/* Owner sees Edit/Delete */}
                        {isOwner && (
                            <>
                                <Link to={`/articles/${articleId}/edit`} className="btn-edit">Edit</Link>
                                <button className="btn-delete" onClick={onDelete}>Delete</button>
                            </>
                        )}

                        {/* Logged in User (who is NOT owner and hasn't liked yet) sees Like */}
                        {auth.accessToken && !isOwner && !hasLiked && (
                            <button className="btn-like" onClick={onLike}>Like Article</button>
                        )}

                        {/* Confirmation text */}
                        {hasLiked && <span className="liked-text">You liked this!</span>}
                    </div>
                </div>
            </div>
        </section>
    );
}