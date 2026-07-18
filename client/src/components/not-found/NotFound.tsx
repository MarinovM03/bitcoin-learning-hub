import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Zap, ArrowLeft, Search } from "lucide-react";
import { getRandomFact } from "../../utils/bitcoinFacts";
import PageMeta from "../page-meta/PageMeta";

export default function NotFound() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const onSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed.length < 2) return;
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    return (
        <section className="page-content">
            <PageMeta title="Page Not Found" description="The page you're looking for doesn't exist." noindex />
            <div className="not-found-page">
                <div className="not-found-glow" />

                <div className="not-found-particles">
                    <span className="particle">₿</span>
                    <span className="particle">₿</span>
                    <span className="particle">₿</span>
                    <span className="particle">₿</span>
                    <span className="particle">₿</span>
                    <span className="particle">₿</span>
                    <span className="particle">₿</span>
                </div>

                <div className="not-found-symbol">₿</div>

                <div className="not-found-code">404</div>

                <h1 className="not-found-title">Block Not Found</h1>

                <p className="not-found-message">
                    This block was never mined. The page you're looking for
                    doesn't exist or was never added to the chain in the first place.
                </p>

                <div className="not-found-meta">
                    <div className="not-found-meta-item">
                        <span className="not-found-meta-label">Error Code</span>
                        <span className="not-found-meta-value">0x404</span>
                    </div>
                    <div className="not-found-meta-divider" />
                    <div className="not-found-meta-item">
                        <span className="not-found-meta-label">Block Status</span>
                        <span className="not-found-meta-value not-found-meta-value--invalid">Invalid</span>
                    </div>
                    <div className="not-found-meta-divider" />
                    <div className="not-found-meta-item">
                        <span className="not-found-meta-label">Chain</span>
                        <span className="not-found-meta-value">Bitcoin Mainnet</span>
                    </div>
                </div>

                <form className="not-found-search" onSubmit={onSearch} role="search">
                    <Search size={16} strokeWidth={2.25} className="not-found-search-icon" />
                    <input
                        type="search"
                        className="not-found-search-input"
                        placeholder="Search articles and glossary terms..."
                        aria-label="Search the site"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="not-found-search-btn" disabled={query.trim().length < 2}>
                        Search
                    </button>
                </form>

                <div className="not-found-actions">
                    <Link to="/" className="btn-hero-primary">
                        <ArrowLeft size={16} strokeWidth={2.25} />
                        Back to Genesis Block
                    </Link>
                    <Link to="/articles" className="btn-hero-secondary">
                        Browse Articles
                    </Link>
                </div>

                <div className="not-found-fact">
                    <span className="not-found-fact-label">
                        <Zap size={14} strokeWidth={2.25} />
                        Did you know?
                    </span>
                    <p className="not-found-fact-text">{getRandomFact()}</p>
                </div>
            </div>
        </section>
    );
}