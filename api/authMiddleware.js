var config = require('../config.json');
var admin = require('./admin');
var formidable = require('formidable')({multiples: true});

var openRoutes = [
    "/admin/login"
];

module.exports.middleware = (req, res, next) => {

    var openRoute = false;

    openRoutes.forEach((route) => {
        if(req.url.startsWith(route) == true) {
            openRoute = true;
            next();
        }
    });

    if(openRoute === true) return;

    if(!req.headers.authorization) {
        res.status(401).send({
            message: "Authentication token missing or invalid"
        });
        res.end();
        return;
    }else {
        admin.authenticateToken(req.headers.authorization.split(" ")[1], (data) => {
            if(data.error) {
                res.status(401).send({
                    message: "Failed to verify authentication token"
                });
                res.end();
                return;
            }
            next();
        });
    }
};