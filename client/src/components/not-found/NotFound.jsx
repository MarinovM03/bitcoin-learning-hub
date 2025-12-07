import { Link } from "react-router";

export default function NotFound() {
    return (
        <section className="page-content">
            <div className="not-found-page">
                <h1>404</h1>
                <p>We couldn't find the block you were looking for.</p>
                <p>It might have been orphaned or never mined.</p>
                
                <Link to="/" className="btn-home">Back to Genesis Block</Link>
            </div>
        </section>
    );
}