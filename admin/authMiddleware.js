var cookie = require('cookies');
var config = require('../config.json');

var openRoutes = [
    "/login",
    "/authenticate"
];

module.exports.middleware = (req, res, next) => {
    var cookies = new cookie(req, res);
    var openRoute = false;

    openRoutes.forEach((route) => {
        if(req.url.startsWith(route) == true) {
            openRoute = true;
            next();
        }
    });

    if(openRoute === true) return;

    if(!cookies.get('authToken')) {
        res.redirect(config.admin.root + '/login');
        res.end();
        return;
    }else {
        req.auth = {
            token: cookies.get('authToken'),
            uname: cookies.get('authUser')
        };
    }

    next();
};