var config = require('../config.json');
var indianStates = require('./data/IndianStates.json');
var mainMenu = require('./data/mainMenu.json');

module.exports = {

    setup: (app, admin) => {

        // Home Page
        app.get('/', function(req, res) {
            res.render('pages/index', {
                config: config.website,
                states: indianStates
            });
        });

        // View Post Page
        app.get('/post/:id', function(req, res) {
            res.render('pages/post', {
                config: config.website,
                id: req.params.id
            });
        });

        // About Page
        app.get('/about', function(req, res) {
            res.render('pages/about', {
                config: config.website
            });
        });

        // Administration Home Page
        admin.get('/', function(req, res) {
            res.render('index', {
                config: config.website
            });
        });

    }

}