import { Link } from "react-router";

export default function NotFound() {
    return (
        <section className="page-content">
            <div className="not-found-page">
                <p className="not-found-eyebrow">₿ Error 404</p>
                <h1>404</h1>
                <p>This block was never mined.</p>
                <p>The page you're looking for doesn't exist or has been removed.</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn-home">
                        ← Back to Genesis Block
                    </Link>
                </div>
            </div>
        </section>
    );
}