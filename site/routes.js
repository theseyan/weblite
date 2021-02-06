var config = require('../config.json');
var indianStates = require('./src/data/IndianStates.json');
var mainMenu = require('./src/data/mainMenu.json');
var footerMenu = require('./src/data/footerMenu.json');

var api = require('../api/site');

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

    setup: (app) => {

        // Home Page
        app.get('/', function(req, res) {
            api.getPosts({
                query: 1,
                orderBy: 'date DESC',
                limit: 8
            }, (result) => {
                if(result.error) {
                    res.send('An error occurred.');
                    return;
                }
                res.render('pages/index', Object.assign(data(req, res), {posts: result.posts}));
            });
        });

        // View Post Page
        app.get('/post/:id', function(req, res) {
            api.getPosts({
                query: 'id = ' + req.params.id
            }, (result) => {
                if(result.error) {
                    res.send('An error occurred.');
                    return;
                }
                res.render('pages/post', Object.assign(data(req, res), {
                    post: result.posts[0]
                }));
            });
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

    }

}