import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router";
import { Menu, X, PenLine, Search } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import AccountMenu from "./AccountMenu";
import SearchOverlay from "../search-overlay/SearchOverlay";

const NAV_LINKS = [
    { to: "/", label: "Home", end: true },
    { to: "/articles", label: "Articles" },
    { to: "/paths", label: "Paths" },
    { to: "/glossary", label: "Glossary" },
    { to: "/dca", label: "DCA Calculator" },
    { to: "/mempool", label: "Mempool" },
    { to: "/address", label: "Address Lookup" },
    { to: "/multisig", label: "Multisig" },
];

export default function Navbar() {
    const { isAuthenticated } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsMobileOpen(false);
        setIsSearchOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    useEffect(() => {
        if (!isMobileOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isMobileOpen]);

    useEffect(() => {
        if (!isMobileOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape") setIsMobileOpen(false);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isMobileOpen]);

    const renderLinks = (onClick) => NAV_LINKS.map(link => (
        <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onClick}
            className={({ isActive }) =>
                `navbar-link ${isActive ? "navbar-link--active" : ""}`
            }
        >
            {link.label}
        </NavLink>
    ));

    return (
        <nav className="navbar" aria-label="Primary">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand" aria-label="Bitcoin Hub home">
                    <span className="navbar-brand-mark" aria-hidden="true">₿</span>
                    <span className="navbar-brand-text">Bitcoin Hub</span>
                </Link>

                <div className="navbar-links">
                    {renderLinks()}
                </div>

                <div className="navbar-actions">
                    <button
                        type="button"
                        className="navbar-search-btn"
                        onClick={() => setIsSearchOpen(true)}
                        aria-label="Open search"
                    >
                        <Search size={16} strokeWidth={2.25} />
                        <span className="navbar-search-btn-label">Search</span>
                        <kbd className="navbar-search-btn-kbd">Ctrl K</kbd>
                    </button>
                    {isAuthenticated ? (
                        <>
                            <Link to="/articles/create" className="navbar-write">
                                <PenLine size={16} strokeWidth={2.25} />
                                <span>Write</span>
                            </Link>
                            <AccountMenu />
                        </>
                    ) : (
                        <div className="navbar-auth">
                            <Link to="/login" className="navbar-auth-ghost">Log in</Link>
                            <Link to="/register" className="navbar-auth-primary">Sign up</Link>
                        </div>
                    )}

                    <button
                        type="button"
                        className="navbar-hamburger"
                        onClick={() => setIsMobileOpen(true)}
                        aria-label="Open navigation"
                        aria-expanded={isMobileOpen}
                    >
                        <Menu size={22} strokeWidth={2.25} />
                    </button>
                </div>
            </div>

            {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}

            {isMobileOpen && createPortal(
                <div className="navbar-mobile" role="dialog" aria-modal="true" aria-label="Navigation">
                    <div className="navbar-mobile-head">
                        <Link to="/" className="navbar-brand" onClick={() => setIsMobileOpen(false)}>
                            <span className="navbar-brand-mark" aria-hidden="true">₿</span>
                            <span className="navbar-brand-text">Bitcoin Hub</span>
                        </Link>
                        <button
                            type="button"
                            className="navbar-mobile-close"
                            onClick={() => setIsMobileOpen(false)}
                            aria-label="Close navigation"
                        >
                            <X size={22} strokeWidth={2.25} />
                        </button>
                    </div>

                    <div className="navbar-mobile-links">
                        {renderLinks(() => setIsMobileOpen(false))}
                    </div>

                    {!isAuthenticated && (
                        <div className="navbar-mobile-auth">
                            <Link to="/login" className="navbar-auth-ghost" onClick={() => setIsMobileOpen(false)}>
                                Log in
                            </Link>
                            <Link to="/register" className="navbar-auth-primary" onClick={() => setIsMobileOpen(false)}>
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </nav>
    );
}
