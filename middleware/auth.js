
const jwt = require('jsonwebtoken');
require('dotenv').load;

// authorization - doesn't use async function because JWT module uses a callback pattern
exports.adminRequired = function (req, res, next) {
    // try to get the token from HTTP HEADER via req.headers.authorization
    // extracted from bearer (ex. bearer asdfasdf)
    try {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.SECRET_KEY_JWT, function (err, payload) {
            if (payload) {
                return next();
            } else {
                return next({
                    status: 401,
                    message: "Admin required!"
                });
            }
        })
    } catch (err) {
        return next({
            status: 401,
            message: "Admin required."
        });
    }
}