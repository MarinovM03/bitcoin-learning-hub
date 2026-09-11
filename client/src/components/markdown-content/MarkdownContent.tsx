import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { useMemo } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import type { PluggableList } from 'unified';
import { rehypeGlossaryLinks } from '../../utils/rehypeGlossaryLinks';
import type { GlossaryEntry } from '../../utils/rehypeGlossaryLinks';

const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        '*': [...(defaultSchema.attributes?.['*'] ?? []), 'id'],
    },
};

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

const MarkdownLink = ({ href, children, className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) return <a className={className} {...rest}>{children}</a>;

    if (isInternal(href)) {
        return <Link to={href} className={className}>{children}</Link>;
    }

    if (href.startsWith('#')) {
        return <a href={href} className={className} {...rest}>{children}</a>;
    }

    return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer nofollow" {...rest}>
            {children}
        </a>
    );
};

interface MarkdownContentProps {
    content?: string;
    className?: string;
    glossary?: GlossaryEntry[];
}

export default function MarkdownContent({ content, className = '', glossary }: MarkdownContentProps) {
    const plugins = useMemo(() => {
        const base: PluggableList = [rehypeSlug, [rehypeSanitize, sanitizeSchema]];
        return glossary?.length ? [...base, rehypeGlossaryLinks(glossary)] : base;
    }, [glossary]);

    if (!content) return null;

    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={plugins}
                components={{ a: MarkdownLink }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
