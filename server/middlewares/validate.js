export const validate = (schemas) => (req, _res, next) => {
    try {
        if (schemas.body) {
            req.body = schemas.body.parse(req.body);
        }
        if (schemas.params) {
            req.params = schemas.params.parse(req.params);
        }
        next();
    } catch (err) {
        next(err);
    }
};
