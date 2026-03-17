import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export default function Footer() {
    const year = new Date().getFullYear();
    const { isAuthenticated } = useAuth();

    return (
        <footer className="footer">
            <div className="footer-inner">

                <div className="footer-brand">
                    <div className="footer-logo">
                        <span className="footer-logo-icon">₿</span>
                        <span className="footer-logo-text">Bitcoin Learning Hub</span>
                    </div>
                    <p className="footer-tagline">
                        Community-driven Bitcoin education — articles, glossary, and live market data in one place.
                    </p>
                </div>

                <div className="footer-nav">
                    <div className="footer-nav-group">
                        <span className="footer-nav-label">Explore</span>
                        <Link to="/" className="footer-nav-link">Home</Link>
                        <Link to="/articles" className="footer-nav-link">Articles</Link>
                        <Link to="/glossary" className="footer-nav-link">Glossary</Link>
                    </div>
                    <div className="footer-nav-group">
                        <span className="footer-nav-label">Account</span>
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" className="footer-nav-link">Profile</Link>
                                <Link to="/bookmarks" className="footer-nav-link">Bookmarks</Link>
                                <Link to="/articles/create" className="footer-nav-link">Write Article</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="footer-nav-link">Login</Link>
                                <Link to="/register" className="footer-nav-link">Register</Link>
                            </>
                        )}
                    </div>
                    <div className="footer-nav-group">
                        <span className="footer-nav-label">Stack</span>
                        <span className="footer-nav-text">ReactJS 19</span>
                        <span className="footer-nav-text">Node / Express</span>
                        <span className="footer-nav-text">MongoDB</span>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <span>© {year} Bitcoin Learning Hub. Built by Martin Marinov.</span>
                <a href="https://github.com/MarinovM03/bitcoin-learning-hub" target="_blank" rel="noreferrer" className="footer-github">GitHub →</a>
            </div>
        </footer>
    );
}