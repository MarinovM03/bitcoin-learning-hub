import { useEffect, useState } from "react";
import { Link } from "react-router";
import * as articleService from '../../services/articleService';
import StatsBar from "../stats-bar/StatsBar";
import HalvingCountdown from "../halving-countdown/HalvingCountdown";
import FearGreedWidget from "../fear-greed-widget/FearGreedWidget";
import Spinner from "../spinner/Spinner";

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/600x400/1a1a1a/F7931A?text=₿';
};

export default function Home() {
    const [latestArticles, setLatestArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        articleService.getAll({ limit: 4, sort: 'latest' })
            .then(result => setLatestArticles(result.articles ?? []))
            .catch(err => console.log(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const [featured, ...rest] = latestArticles;

    return (
        <section id="home-page" className="page-content">

            <div className="hero-section">
                <div className="hero-dot-grid" />
                <div className="hero-glow" />

                <div className="hero-content">
                    <div className="hero-eyebrow-row">
                        <span className="hero-eyebrow">₿ Bitcoin Learning Hub</span>
                        <span className="hero-badge">Est. 2009</span>
                        <span className="hero-badge">21M Supply</span>
                        <span className="hero-badge">Open Source</span>
                    </div>
                    <h1>
                        Understand <span>Bitcoin</span>,<br />
                        from the ground up.
                    </h1>
                    <p className="lead">
                        Community-written articles, a living glossary, and live market data —
                        everything a beginner or enthusiast needs in one place.
                    </p>
                    <div className="hero-actions">
                        <Link to="/articles" className="btn-hero-primary">
                            Browse Articles →
                        </Link>
                        <Link to="/glossary" className="btn-hero-secondary">
                            Explore Glossary
                        </Link>
                    </div>
                </div>
            </div>

            <div className="dashboard-row">
                <div className="dashboard-main">
                    <StatsBar />
                </div>
                <div className="dashboard-side">
                    <HalvingCountdown />
                </div>
                <div className="dashboard-side">
                    <FearGreedWidget />
                </div>
            </div>

            <div className="latest-articles">
                <div className="section-heading">
                    <h2>Latest Knowledge</h2>
                    <div className="section-heading-line" />
                    <Link to="/articles" className="section-heading-link">
                        View all →
                    </Link>
                </div>

                {isLoading ? (
                    <Spinner />
                ) : latestArticles.length === 0 ? (
                    <p className="no-articles">No articles yet. Be the first to contribute!</p>
                ) : (
                    <div className="magazine-grid">
                        {featured && (
                            <Link to={`/articles/${featured._id}/details`} className="magazine-featured">
                                <img
                                    src={featured.imageUrl}
                                    alt={featured.title}
                                    className="magazine-featured-img"
                                    onError={handleImgError}
                                />
                                <div className="magazine-featured-overlay">
                                    <span className="magazine-tag">{featured.category}</span>
                                    <h3 className="magazine-featured-title">{featured.title}</h3>
                                    <p className="magazine-featured-summary">{featured.summary}</p>
                                    <span className="magazine-read-more">Read Article →</span>
                                </div>
                            </Link>
                        )}

                        {rest.length > 0 && (
                            <div className="magazine-stack">
                                {rest.map(article => (
                                    <Link
                                        key={article._id}
                                        to={`/articles/${article._id}/details`}
                                        className="magazine-small-card"
                                    >
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="magazine-small-img"
                                            onError={handleImgError}
                                        />
                                        <div className="magazine-small-body">
                                            <span className="magazine-tag">{article.category}</span>
                                            <h3 className="magazine-small-title">{article.title}</h3>
                                            <p className="magazine-small-summary">{article.summary}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

        </section>
    );
}