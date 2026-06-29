import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

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
                rehypePlugins={[rehypeSanitize]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
