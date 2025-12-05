import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import * as articleService from '../../services/articleService';

export default function Details() {
    const [article, setArticle] = useState({});
    const { articleId } = useParams();
    
    useEffect(() => {
        articleService.getOne(articleId)
            .then(result => {
                setArticle(result);
            })
            .catch(err => alert(err.message));
    }, [articleId]);

    // TODO: Authentication
    const isOwner = true;

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
                    </div>

                    <div className="details-content">
                        <p>{article.content}</p>
                    </div>

                    {isOwner && (
                        <div className="details-buttons">
                            <Link to={`/articles/${articleId}/edit`} className="btn-edit">Edit</Link>
                            <button className="btn-delete">Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}