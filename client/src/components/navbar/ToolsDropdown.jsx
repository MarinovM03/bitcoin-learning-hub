import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { TOOLS } from '../../utils/navTools';

export default function ToolsDropdown() {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const containerRef = useRef(null);

    const isActive = TOOLS.some(t => location.pathname === t.to || location.pathname.startsWith(t.to + '/'));

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        window.addEventListener('keydown', handleKey);
        window.addEventListener('mousedown', handleClick);
        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('mousedown', handleClick);
        };
    }, [open]);

    return (
        <div
            ref={containerRef}
            className="tools-dropdown"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className={`navbar-link tools-dropdown-trigger ${isActive ? 'navbar-link--active' : ''} ${open ? 'tools-dropdown-trigger--open' : ''}`}
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                aria-haspopup="true"
            >
                Tools
                <ChevronDown size={14} strokeWidth={2.5} className="tools-dropdown-chevron" />
            </button>

            {open && (
                <div className="tools-dropdown-panel" role="menu">
                    {TOOLS.map(({ to, label, description, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `tools-dropdown-item ${isActive ? 'tools-dropdown-item--active' : ''}`
                            }
                            role="menuitem"
                        >
                            <span className="tools-dropdown-item-icon">
                                <Icon size={16} strokeWidth={2.25} />
                            </span>
                            <span className="tools-dropdown-item-text">
                                <span className="tools-dropdown-item-label">{label}</span>
                                <span className="tools-dropdown-item-desc">{description}</span>
                            </span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}
