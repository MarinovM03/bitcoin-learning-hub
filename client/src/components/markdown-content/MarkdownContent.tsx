import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { AnchorHTMLAttributes } from 'react';

const sanitizeSchema = {
    ...defaultSchema,
    attributes: {
        ...defaultSchema.attributes,
        '*': [...(defaultSchema.attributes?.['*'] ?? []), 'id'],
    },
};

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

const MarkdownLink = ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) return <a {...rest}>{children}</a>;

    if (isInternal(href)) {
        return <Link to={href}>{children}</Link>;
    }

    if (href.startsWith('#')) {
        return <a href={href} {...rest}>{children}</a>;
    }

    return (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...rest}>
            {children}
        </a>
    );
};

interface MarkdownContentProps {
    content?: string;
    className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
    if (!content) return null;
    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, [rehypeSanitize, sanitizeSchema]]}
                components={{ a: MarkdownLink }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
