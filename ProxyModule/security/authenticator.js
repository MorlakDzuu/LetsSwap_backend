const jwt = require('jsonwebtoken');
const config = require('../config');


function apiAuthenticateJWT(req, res, next) {
    const token = req.headers.authorization;
    jwt.verify(token, config.jwtApiAccessToken, (error, user) => {
        if (error) {
            res.status(401);
            res.json({message: "auth error"});
            return;
        }
        req.user = user;
        next();
    });
}


module.exports = {
    apiAuthenticateJWT
};