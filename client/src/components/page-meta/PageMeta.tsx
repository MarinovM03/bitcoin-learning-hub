const SITE_NAME = 'Bitcoin Learning Hub';
const DEFAULT_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1024px-Bitcoin.svg.png';
const DEFAULT_DESCRIPTION = 'Learn Bitcoin fundamentals, technology, and economics through articles, glossary terms, learning paths, and live market tools.';

interface PageMetaProps {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    noindex?: boolean;
}

const PageMeta = ({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    type = 'website',
    noindex = false,
}: PageMetaProps) => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;

    return (
        <>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content={SITE_NAME} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </>
    );
};

export default PageMeta;
