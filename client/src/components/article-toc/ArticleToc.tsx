import { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import type { TocHeading } from '../../utils/markdownToc';

const ID_PREFIX = 'user-content-';

interface ArticleTocProps {
    headings: TocHeading[];
}

export default function ArticleToc({ headings }: ArticleTocProps) {
    const [activeSlug, setActiveSlug] = useState<string | null>(null);

    useEffect(() => {
        if (headings.length === 0) return;

        const elements = headings
            .map(h => document.getElementById(ID_PREFIX + h.slug))
            .filter((el): el is HTMLElement => el !== null);
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) {
                    setActiveSlug(visible[0].target.id.replace(ID_PREFIX, ''));
                }
            },
            { rootMargin: '-80px 0px -70% 0px' },
        );

        for (const el of elements) observer.observe(el);
        return () => observer.disconnect();
    }, [headings]);

    if (headings.length < 2) return null;

    const minDepth = Math.min(...headings.map(h => h.depth));

    return (
        <nav className="article-toc" aria-label="Table of contents">
            <span className="details-action-panel-title">
                <List size={14} strokeWidth={2.25} />
                On This Page
            </span>
            <ul className="article-toc-list">
                {headings.map(h => (
                    <li
                        key={h.slug}
                        className={`article-toc-item article-toc-item--depth-${h.depth - minDepth} ${
                            activeSlug === h.slug ? 'article-toc-item--active' : ''
                        }`}
                    >
                        <a href={`#${ID_PREFIX}${h.slug}`} className="article-toc-link">
                            {h.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
