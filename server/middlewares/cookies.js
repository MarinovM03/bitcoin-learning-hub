export const parseCookies = (req, _res, next) => {
    req.cookies = {};

    const header = req.headers.cookie;
    if (!header) return next();

    for (const pair of header.split(';')) {
        const separator = pair.indexOf('=');
        if (separator === -1) continue;

        const name = pair.slice(0, separator).trim();
        if (!name) continue;

        const rawValue = pair.slice(separator + 1).trim();
        try {
            req.cookies[name] = decodeURIComponent(rawValue);
        } catch {
            req.cookies[name] = rawValue;
        }
    }

    next();
};
