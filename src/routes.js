var config = require('../config.json');
var indianStates = require('./data/IndianStates.json');
var mainMenu = require('./data/mainMenu.json');
var footerMenu = require('./data/footerMenu.json');

var data = (req, res) => {
    return {
        config: config.website,
        menus: {
            main: mainMenu,
            indianStates: indianStates,
            footer: footerMenu
        },
        url: req.url
    };
};

module.exports = {

    setup: (app, admin) => {

        // Home Page
        app.get('/', function(req, res) {
            res.render('pages/index', data(req, res));
        });

        // View Post Page
        app.get('/post/:id', function(req, res) {
            res.render('pages/post', Object.assign(data(req, res), {
                id: req.params.id
            }));
        });

        // Search Page
        app.get('/search/:q', function(req, res) {
            res.render('pages/search', Object.assign(data(req, res), {
                query: req.params.q
            }));
        });

        // Posts Page
        app.get('/posts/:q', function(req, res) {
            res.render('pages/posts', Object.assign(data(req, res), {
                query: req.params.q
            }));
        });

        // About Page
        app.get('/about', function(req, res) {
            res.render('pages/about', data(req, res));
        });

        // Contact Us Page
        app.get('/contact', function(req, res) {
            res.render('pages/contact', data(req, res));
        });

        // Administration Home Page
        admin.get('/', function(req, res) {
            res.render('index', data(req, res));
        });

    }

}