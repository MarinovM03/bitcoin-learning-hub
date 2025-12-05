import { Link } from "react-router";

export default function ArticleItem({
    _id,
    title,
    summary,
    imageUrl,
}) {
    return (
        <div className="article-card">
            <img src={imageUrl} 
                alt={title} 
                className="article-image" />

            <div className="article-info">
                <h3>{title}</h3>
                <p>{summary}</p>
                <Link to={`/articles/${_id}/details`} className="btn-details">Read More</Link>
            </div>
        </div>
    );
}