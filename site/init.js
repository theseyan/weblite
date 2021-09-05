/**
 * Initialization module for Frontend Site
*/

var config = require('../config.json');
var express = require('express');
var routes = require('./routes');

module.exports = () => {
    // Express server for the Frontend Website
    var app = express();

    // Set view engine for frontend
    app.set('view engine', 'ejs');
    app.set('views', './site/views');

    // Serve static files
    app.use(express.static('./site/static'));

    // Set up routes
    routes.setup(app);

    // Start the Frontend server
    app.listen(config.website.port);
};