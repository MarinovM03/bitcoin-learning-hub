import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import * as articleService from '../../services/articleService';

export default function Details({
    auth,
}) {
    const navigate = useNavigate();
    const [article, setArticle] = useState({});
    const { articleId } = useParams();
    
    useEffect(() => {
        articleService.getOne(articleId)
            .then(result => {
                setArticle(result);
            })
            .catch(err => alert(err.message));
    }, [articleId]);

    const deleteArticleClickHandler = async () => {
        const hasConfirmed = confirm(`Are you sure you want to delete ${article.title}?`);

        if (hasConfirmed) {
            try {
                await articleService.remove(articleId);

                navigate('/articles');
            } catch (err) {
                console.log("Delete failed", err.message);
            }
        }
    };

    const isOwner = auth._id === article._ownerId;

    return (
        <section id="details-page" className="page-content">
            <div className="details-page">
                
                <div className="details-hero">
                    <img 
                        src={article.imageUrl} 
                        alt={article.title}  
                        className="details-img" 
                    />
                </div>

                <div className="details-container">
                    <div className="details-header">
                        <span className="category-tag">{article.category}</span>
                        <h1>{article.title}</h1>
                        <p className="details-summary">{article.summary}</p>
                    </div>

                    <div className="details-content">
                        <p>{article.content}</p>
                    </div>

                    {isOwner && (
                        <div className="details-buttons">
                            <Link to={`/articles/${articleId}/edit`} className="btn-edit">Edit</Link>
                            <button onClick={deleteArticleClickHandler} className="btn-delete">Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}