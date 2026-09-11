import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link } from "react-router";
import { formatViews } from "../../utils/formatters";
import { handleImgError, handleAvatarError, DEFAULT_AVATAR } from "../../utils/imageHelpers";
import { articlePath } from "../../utils/articlePath";
import Skeleton from "../skeleton/Skeleton";
import type { Article, ArticleOwnerRef } from "../../types";

type ArticleCardArticle =
    Pick<Article, '_id' | 'title' | 'category' | 'imageUrl' | 'summary'>
    & Partial<Pick<Article, 'difficulty' | 'readingTime' | 'wordCount' | 'views'>>
    & { _ownerId?: string | ArticleOwnerRef };

interface ArticleCardProps {
    article: ArticleCardArticle;
    readLabel?: string;
    showAuthor?: boolean;
}

export default function ArticleCard({ article, readLabel = "Read Article →", showAuthor = false }: ArticleCardProps) {
    const [imgLoaded, setImgLoaded] = useState(false);

    const author = typeof article._ownerId === 'object' ? article._ownerId : null;

    return (
        <Link
            to={articlePath(article)}
            className="catalog-card"
        >
            <div className="catalog-card-img-wrap">
                {!imgLoaded && <Skeleton className="catalog-card-img-skeleton" />}
                <img
                    src={article.imageUrl}
                    alt={article.title}
                    className={`catalog-card-img ${imgLoaded ? 'is-loaded' : ''}`}
                    loading="lazy"
                    decoding="async"
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
                {showAuthor && author && (
                    <span className="catalog-card-author">
                        <img
                            src={author.profilePicture || DEFAULT_AVATAR}
                            alt=""
                            className="catalog-card-author-avatar"
                            loading="lazy"
                            decoding="async"
                            onError={handleAvatarError}
                        />
                        {author.username}
                    </span>
                )}
                <h3 className="catalog-card-title">{article.title}</h3>
                <p className="catalog-card-summary">{article.summary}</p>
                <div className="catalog-card-footer">
                    <span className="catalog-card-meta">{article.readingTime ?? 1} min read</span>
                    {!!article.wordCount && (
                        <span className="catalog-card-meta">{article.wordCount.toLocaleString()} words</span>
                    )}
                    <span className="catalog-card-meta">{formatViews(article.views ?? 0)} views</span>
                    <span className="catalog-card-read">{readLabel}</span>
                </div>
            </div>
        </Link>
    );
}
