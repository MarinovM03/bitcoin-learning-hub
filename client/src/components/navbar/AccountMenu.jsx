import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronDown, User, FileText, Bookmark, Route, Award, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

export default function AccountMenu() {
    const { username, profilePicture, logoutHandler, isAdmin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        const handleKey = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleKey);
        };
    }, [isOpen]);

    const close = () => setIsOpen(false);

    const handleLogout = () => {
        logoutHandler();
        close();
    };

    return (
        <div className="account-menu" ref={wrapperRef}>
            <button
                type="button"
                className={`account-menu-trigger ${isOpen ? "account-menu-trigger--open" : ""}`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="Account menu"
            >
                <img
                    src={profilePicture || defaultAvatar}
                    alt=""
                    className="account-menu-avatar"
                />
                <ChevronDown size={14} strokeWidth={2.5} className="account-menu-chevron" />
            </button>

            {isOpen && (
                <div className="account-menu-panel" role="menu">
                    <div className="account-menu-header">
                        <img
                            src={profilePicture || defaultAvatar}
                            alt=""
                            className="account-menu-header-avatar"
                        />
                        <div className="account-menu-header-text">
                            <span className="account-menu-header-name">{username}</span>
                            <span className="account-menu-header-role">{isAdmin ? 'Admin' : 'Member'}</span>
                        </div>
                    </div>

                    <div className="account-menu-divider" />

                    <Link to="/profile" className="account-menu-item" role="menuitem" onClick={close}>
                        <User size={16} strokeWidth={2} />
                        <span>Profile</span>
                    </Link>
                    <Link to="/my-articles" className="account-menu-item" role="menuitem" onClick={close}>
                        <FileText size={16} strokeWidth={2} />
                        <span>My Articles</span>
                    </Link>
                    <Link to="/my-paths" className="account-menu-item" role="menuitem" onClick={close}>
                        <Route size={16} strokeWidth={2} />
                        <span>My Paths</span>
                    </Link>
                    <Link to="/certifications" className="account-menu-item" role="menuitem" onClick={close}>
                        <Award size={16} strokeWidth={2} />
                        <span>Certifications</span>
                    </Link>
                    <Link to="/bookmarks" className="account-menu-item" role="menuitem" onClick={close}>
                        <Bookmark size={16} strokeWidth={2} />
                        <span>Bookmarks</span>
                    </Link>

                    {isAdmin && (
                        <>
                            <div className="account-menu-divider" />
                            <Link to="/admin" className="account-menu-item account-menu-item--admin" role="menuitem" onClick={close}>
                                <ShieldCheck size={16} strokeWidth={2} />
                                <span>Admin Dashboard</span>
                            </Link>
                        </>
                    )}

                    <div className="account-menu-divider" />

                    <button
                        type="button"
                        className="account-menu-item account-menu-item--danger"
                        role="menuitem"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} strokeWidth={2} />
                        <span>Log out</span>
                    </button>
                </div>
            )}
        </div>
    );
}
