import { useEffect } from 'react';

const SITE_NAME = 'Bitcoin Learning Hub';
const DEFAULT_IMAGE = '/og-image.png';
const DEFAULT_DESCRIPTION = 'Learn Bitcoin fundamentals, technology, and economics through in-depth articles, an A–Z glossary, and live market tools.';

interface PageMetaProps {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    noindex?: boolean;
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
}

const absolute = (url: string) =>
    /^https?:\/\//.test(url) ? url : `${window.location.origin}${url}`;

const PageMeta = ({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    type = 'website',
    noindex = false,
    publishedTime,
    modifiedTime,
    author,
    section,
}: PageMetaProps) => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    const imageUrl = absolute(image);
    const isArticle = type === 'article';

    useEffect(() => {
        document.head.querySelectorAll('[data-default-meta]').forEach((el) => el.remove());
    }, []);

    return (
        <>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:alt" content={title ?? SITE_NAME} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_US" />

            {isArticle && publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {isArticle && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {isArticle && author && <meta property="article:author" content={author} />}
            {isArticle && section && <meta property="article:section" content={section} />}

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:image:alt" content={title ?? SITE_NAME} />
        </>
    );
};

export default PageMeta;
