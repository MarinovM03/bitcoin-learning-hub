import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import BitcoinPrice from "../common/BitcoinPrice";

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function Sidebar() {
    const { isAuthenticated, logoutHandler, username, profilePicture } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/' ? 'sidebar-link active' : 'sidebar-link';
        if (path === '/articles') {
            const articleSubRoutes = ['/articles/create', '/my-articles'];
            if (articleSubRoutes.some(r => location.pathname.startsWith(r))) return 'sidebar-link';
            return location.pathname.startsWith('/articles') ? 'sidebar-link active' : 'sidebar-link';
        }
        return location.pathname.startsWith(path) ? 'sidebar-link active' : 'sidebar-link';
    };

    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            <button
                className="sidebar-hamburger"
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Toggle navigation"
            >
                <span className="sidebar-hamburger-bar" />
                <span className="sidebar-hamburger-bar" />
                <span className="sidebar-hamburger-bar" />
            </button>

            <div
                className={`sidebar-overlay ${isOpen ? "sidebar-overlay--visible" : ""}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>

                <div className="sidebar-logo">
                    <Link to="/" className="sidebar-logo-link" onClick={closeSidebar}>
                        <div className="sidebar-logo-icon">₿</div>
                        <div className="sidebar-logo-text">
                            <span className="sidebar-logo-title">Bitcoin Hub</span>
                            <span className="sidebar-logo-sub">Learning Platform</span>
                        </div>
                    </Link>
                </div>

                <div className="sidebar-price">
                    <BitcoinPrice />
                </div>

                <nav className="sidebar-nav">
                    <span className="sidebar-nav-label">Explore</span>

                    <Link to="/" className={isActive("/")} onClick={closeSidebar}>
                        <span className="sidebar-link-icon">⚡</span>
                        Home
                    </Link>

                    <Link to="/articles" className={isActive("/articles")} onClick={closeSidebar}>
                        <span className="sidebar-link-icon">📰</span>
                        All Articles
                    </Link>

                    <Link to="/glossary" className={isActive("/glossary")} onClick={closeSidebar}>
                        <span className="sidebar-link-icon">📖</span>
                        Glossary
                    </Link>

                    <Link to="/dca" className={isActive("/dca")} onClick={closeSidebar}>
                        <span className="sidebar-link-icon">📈</span>
                        DCA Calculator
                    </Link>

                    {isAuthenticated && (
                        <>
                            <span className="sidebar-nav-label">My Space</span>

                            <Link to="/articles/create" className={isActive("/articles/create")} onClick={closeSidebar}>
                                <span className="sidebar-link-icon">✏️</span>
                                Write Article
                            </Link>

                            <Link to="/my-articles" className={isActive("/my-articles")} onClick={closeSidebar}>
                                <span className="sidebar-link-icon">📄</span>
                                My Articles
                            </Link>

                            <Link to="/bookmarks" className={isActive("/bookmarks")} onClick={closeSidebar}>
                                <span className="sidebar-link-icon">🔖</span>
                                Bookmarks
                            </Link>

                            <Link to="/profile" className={isActive("/profile")} onClick={closeSidebar}>
                                <span className="sidebar-link-icon">👤</span>
                                Profile
                            </Link>

                            <button
                                className="sidebar-link sidebar-link-logout"
                                onClick={() => { logoutHandler(); closeSidebar(); }}
                            >
                                <span className="sidebar-link-icon">🚪</span>
                                Logout
                            </button>
                        </>
                    )}

                    {!isAuthenticated && (
                        <>
                            <span className="sidebar-nav-label">Account</span>

                            <Link to="/login" className={isActive("/login")} onClick={closeSidebar}>
                                <span className="sidebar-link-icon">🔑</span>
                                Login
                            </Link>

                            <Link to="/register" className={isActive("/register")} onClick={closeSidebar}>
                                <span className="sidebar-link-icon">🚀</span>
                                Register
                            </Link>
                        </>
                    )}
                </nav>

                {isAuthenticated && (
                    <div className="sidebar-user">
                        <img
                            src={profilePicture || defaultAvatar}
                            alt={username}
                            className="sidebar-user-avatar"
                        />
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{username}</span>
                            <span className="sidebar-user-role">Member</span>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}