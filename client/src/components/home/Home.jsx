import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Library, LineChart, Network, ScanLine, TrendingUp, Heart } from "lucide-react";
import * as articleService from '../../services/articleService';
import StatsBar from "../stats-bar/StatsBar";
import HalvingCountdown from "../halving-countdown/HalvingCountdown";
import FearGreedWidget from "../fear-greed-widget/FearGreedWidget";
import HomeLatestSkeleton from "../home-latest-skeleton/HomeLatestSkeleton";

const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/600x400/1a1a1a/F7931A?text=₿';
};

export default function Home() {
    const [latestArticles, setLatestArticles] = useState([]);
    const [trendingArticles, setTrendingArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTrendingLoading, setIsTrendingLoading] = useState(true);

    useEffect(() => {
        articleService.getAll({ limit: 4, sort: 'latest' })
            .then(result => setLatestArticles(result.articles ?? []))
            .catch(err => console.log(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        articleService.getTrending()
            .then(result => setTrendingArticles(Array.isArray(result) ? result : []))
            .catch(err => console.log(err.message))
            .finally(() => setIsTrendingLoading(false));
    }, []);

    const [featured, ...rest] = latestArticles;

    return (
        <section id="home-page" className="page-content">

            <div className="hero-section">
                <div className="hero-dot-grid" />
                <div className="hero-glow" />
                <div className="hero-glow hero-glow--left" />

                <div className="hero-inner">
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
                        <div className="hero-metrics">
                            <div className="hero-metric">
                                <span className="hero-metric-value">21M</span>
                                <span className="hero-metric-label">Supply Cap</span>
                            </div>
                            <div className="hero-metric-divider" />
                            <div className="hero-metric">
                                <span className="hero-metric-value">100%</span>
                                <span className="hero-metric-label">Free Access</span>
                            </div>
                            <div className="hero-metric-divider" />
                            <div className="hero-metric">
                                <span className="hero-metric-value">5+</span>
                                <span className="hero-metric-label">Live Tools</span>
                            </div>
                            <div className="hero-metric-divider" />
                            <div className="hero-metric">
                                <span className="hero-metric-value">∞</span>
                                <span className="hero-metric-label">Things to Learn</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-visual-inner">
                            <p className="hero-visual-label">Explore the Platform</p>
                            <div className="hero-feature-list">
                                <Link to="/articles" className="hero-feature-item">
                                    <span className="hero-feature-icon">
                                        <BookOpen size={22} strokeWidth={1.8} />
                                    </span>
                                    <div className="hero-feature-text">
                                        <span className="hero-feature-name">Articles</span>
                                        <span className="hero-feature-desc">Deep-dive Bitcoin education</span>
                                    </div>
                                    <span className="hero-feature-arrow">→</span>
                                </Link>
                                <Link to="/glossary" className="hero-feature-item">
                                    <span className="hero-feature-icon">
                                        <Library size={22} strokeWidth={1.8} />
                                    </span>
                                    <div className="hero-feature-text">
                                        <span className="hero-feature-name">Glossary</span>
                                        <span className="hero-feature-desc">Every term explained</span>
                                    </div>
                                    <span className="hero-feature-arrow">→</span>
                                </Link>
                                <Link to="/dca" className="hero-feature-item">
                                    <span className="hero-feature-icon">
                                        <LineChart size={22} strokeWidth={1.8} />
                                    </span>
                                    <div className="hero-feature-text">
                                        <span className="hero-feature-name">DCA Calculator</span>
                                        <span className="hero-feature-desc">Simulate your stacking strategy</span>
                                    </div>
                                    <span className="hero-feature-arrow">→</span>
                                </Link>
                                <Link to="/mempool" className="hero-feature-item">
                                    <span className="hero-feature-icon">
                                        <Network size={22} strokeWidth={1.8} />
                                    </span>
                                    <div className="hero-feature-text">
                                        <span className="hero-feature-name">Mempool Visualizer</span>
                                        <span className="hero-feature-desc">Live transaction data</span>
                                    </div>
                                    <span className="hero-feature-arrow">→</span>
                                </Link>
                                <Link to="/address" className="hero-feature-item">
                                    <span className="hero-feature-icon">
                                        <ScanLine size={22} strokeWidth={1.8} />
                                    </span>
                                    <div className="hero-feature-text">
                                        <span className="hero-feature-name">Address Lookup</span>
                                        <span className="hero-feature-desc">Identify any Bitcoin address</span>
                                    </div>
                                    <span className="hero-feature-arrow">→</span>
                                </Link>
                            </div>
                        </div>
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
                    <HomeLatestSkeleton />
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

            {!isTrendingLoading && trendingArticles.length > 0 && (
                <div className="trending-section">
                    <div className="section-heading">
                        <h2>
                            <TrendingUp size={22} strokeWidth={2} className="section-heading-icon" />
                            Trending This Week
                        </h2>
                        <div className="section-heading-line" />
                    </div>

                    <div className="trending-grid">
                        {trendingArticles.map((article, index) => (
                            <Link
                                key={article._id}
                                to={`/articles/${article._id}/details`}
                                className="trending-card"
                            >
                                <div className="trending-rank">#{index + 1}</div>
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="trending-img"
                                    onError={handleImgError}
                                />
                                <div className="trending-body">
                                    <span className="trending-category">{article.category}</span>
                                    <h3 className="trending-title">{article.title}</h3>
                                    <p className="trending-summary">{article.summary}</p>
                                    <span className="trending-likes">
                                        <Heart size={14} strokeWidth={2} fill="currentColor" />
                                        {article.likeCount} {article.likeCount === 1 ? 'like' : 'likes'} this week
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </section>
    );
}