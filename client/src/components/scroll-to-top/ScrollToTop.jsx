import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };

        toggleVisibility();
        window.addEventListener("scroll", toggleVisibility, { passive: true });
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    };

    return (
        <button
            type="button"
            className={`scroll-btn${isVisible ? ' is-visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            aria-hidden={!isVisible}
            tabIndex={isVisible ? 0 : -1}
        >
            <ArrowUp size={22} strokeWidth={2.5} />
        </button>
    );
}
