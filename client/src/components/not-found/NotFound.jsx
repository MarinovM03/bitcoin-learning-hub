import { Link } from "react-router";

export default function NotFound() {
    return (
        <section className="page-content">
            <div className="not-found-page">
                <div className="not-found-glow" />

                <div className="not-found-symbol">₿</div>

                <div className="not-found-code">404</div>

                <h1 className="not-found-title">Block Not Found</h1>

                <p className="not-found-message">
                    This block was never mined. The page you're looking for
                    doesn't exist, has been removed, or never made it onto the chain.
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

                <div className="not-found-actions">
                    <Link to="/" className="btn-hero-primary">
                        ← Back to Genesis Block
                    </Link>
                    <Link to="/articles" className="btn-hero-secondary">
                        Browse Articles
                    </Link>
                </div>
            </div>
        </section>
    );
}