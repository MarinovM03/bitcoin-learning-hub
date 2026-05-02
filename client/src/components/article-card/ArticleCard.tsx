import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link } from "react-router";
import { Layers } from "lucide-react";
import { formatViews } from "../../utils/formatters";
import { handleImgError } from "../../utils/imageHelpers";
import Skeleton from "../skeleton/Skeleton";
import type { Article, ArticleOwnerRef } from "../../types";

type ArticleCardArticle =
    Pick<Article, '_id' | 'title' | 'category' | 'imageUrl' | 'summary'>
    & Partial<Pick<Article, 'difficulty' | 'seriesName' | 'seriesPart' | 'readingTime' | 'views'>>
    & { _ownerId?: string | ArticleOwnerRef };

interface ArticleCardProps {
    article: ArticleCardArticle;
    readLabel?: string;
}

const isPopulatedOwner = (owner: ArticleCardArticle['_ownerId']): owner is ArticleOwnerRef =>
    typeof owner === 'object' && owner !== null && 'username' in owner;

export default function ArticleCard({ article, readLabel = "Read Article →" }: ArticleCardProps) {
    const inSeries = Boolean(article.seriesName) && Number.isFinite(article.seriesPart);
    const [imgLoaded, setImgLoaded] = useState(false);

    const ownerUsername = isPopulatedOwner(article._ownerId) ? article._ownerId.username : null;

    return (
        <Link
            to={`/articles/${article._id}/details`}
            className="catalog-card"
        >
            <div className="catalog-card-img-wrap">
                {!imgLoaded && <Skeleton className="catalog-card-img-skeleton" />}
                <img
                    src={article.imageUrl}
                    alt={article.title}
                    className={`catalog-card-img ${imgLoaded ? 'is-loaded' : ''}`}
                    onLoad={() => setImgLoaded(true)}
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                        handleImgError(e);
                        setImgLoaded(true);
                    }}
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
                        {ownerUsername && (
                            <span className="catalog-card-series__author">· @{ownerUsername}</span>
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
