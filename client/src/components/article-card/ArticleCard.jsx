import { Link } from "react-router";
import { Layers } from "lucide-react";
import { formatViews } from "../../utils/formatters";
import { handleImgError } from "../../utils/imageHelpers";

export default function ArticleCard({ article, readLabel = "Read Article →" }) {
    const inSeries = Boolean(article.seriesName) && Number.isFinite(article.seriesPart);

    return (
        <Link
            to={`/articles/${article._id}/details`}
            className="catalog-card"
        >
            <div className="catalog-card-img-wrap">
                <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="catalog-card-img"
                    onError={handleImgError}
                />
                <span className="catalog-card-category">{article.category}</span>
                {article.difficulty && (
                    <span className={`catalog-card-difficulty catalog-card-difficulty--${article.difficulty.toLowerCase()}`}>
                        {article.difficulty}
                    </span>
                )}
            </div>
            <div className="catalog-card-body">
                {inSeries && (
                    <span className="catalog-card-series">
                        <Layers size={11} strokeWidth={2.5} />
                        <span className="catalog-card-series__name">{article.seriesName}</span>
                        <span>· Part {article.seriesPart}</span>
                        {article._ownerId?.username && (
                            <span className="catalog-card-series__author">· @{article._ownerId.username}</span>
                        )}
                    </span>
                )}
                <h3 className="catalog-card-title">{article.title}</h3>
                <p className="catalog-card-summary">{article.summary}</p>
                <div className="catalog-card-footer">
                    <span className="catalog-card-meta">{article.readingTime ?? 1} min read</span>
                    <span className="catalog-card-meta">{formatViews(article.views ?? 0)} views</span>
                    <span className="catalog-card-read">{readLabel}</span>
                </div>
            </div>
        </Link>
    );
}