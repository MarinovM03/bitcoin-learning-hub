import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import * as articleService from '../../services/articleService';

export default function Details({ auth }) {
    const navigate = useNavigate();
    const { articleId } = useParams();

    const [article, setArticle] = useState({});
    const [totalLikes, setTotalLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        articleService.getOne(articleId)
            .then(setArticle)
            .catch(err => console.log(err));

        fetch(`http://localhost:3030/data/likes?where=articleId%3D"${articleId}"`)
            .then(res => {

                if (res.status === 404) {
                    return [];
                }

                if (!res.ok) {
                    return [];
                }

                return res.json();
            })
            .then(likesArray => {
                if (!Array.isArray(likesArray)) likesArray = [];

                setTotalLikes(likesArray.length);

                if (auth._id) {
                    const isLiked = likesArray.some(like => like._ownerId === auth._id);
                    setHasLiked(isLiked);
                }
            })
            .catch(err => {
                console.log("Likes system offline");
            });

    }, [articleId, auth._id]);

    const isOwner = auth._id === article._ownerId;

    const onDelete = async () => {
        const confirmed = confirm("Are you sure?");
        if (confirmed) {
            await articleService.del(articleId);
            navigate('/articles');
        }
    };

    const onLike = async () => {
        if (hasLiked) return;

        try {
            const response = await fetch('http://localhost:3030/data/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': auth.accessToken
                },
                body: JSON.stringify({ articleId })
            });

            if (response.ok) {
                setTotalLikes(state => state + 1);
                setHasLiked(true);
            }
        } catch (err) {
            console.log("Like failed", err);
        }
    };

    return (
        <section id="details-page" className="page-content">
             <div className="details-page">
                <div className="details-hero">
                    <img className="details-img" src={article.imageUrl} alt={article.title} />
                </div>
                <div className="details-container">
                    <div className="details-header">
                        <h1>{article.title} <span className="likes-counter">({totalLikes} likes)</span></h1>
                        <span className="category-tag">{article.category}</span>
                    </div>
                    <p className="details-summary">{article.summary}</p>
                    <p className="details-content">{article.content}</p>

                    <div className="details-buttons">
                        {isOwner && (
                            <>
                                <Link to={`/articles/${articleId}/edit`} className="btn-edit">Edit</Link>
                                <button className="btn-delete" onClick={onDelete}>Delete</button>
                            </>
                        )}
                        {auth.accessToken && !isOwner && !hasLiked && (
                            <button className="btn-like" onClick={onLike}>Like Article</button>
                        )}
                        {hasLiked && <span className="liked-text">You liked this!</span>}
                    </div>
                </div>
            </div>
        </section>
    );
}