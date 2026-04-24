const sanitize = (value) => {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
        for (const item of value) {
            sanitize(item);
        }
        return;
    }

    for (const key of Object.keys(value)) {
        if (key.startsWith('$') || key.includes('.')) {
            delete value[key];
            continue;
        }
        sanitize(value[key]);
    }
};

export const mongoSanitize = (req, _res, next) => {
    sanitize(req.body);
    sanitize(req.params);
    next();
};
