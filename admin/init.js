/**
 * Initialization module for Administration panel
*/

var config = require('../config.json');
var express = require('express');
var routes = require('./routes');

module.exports = () => {
    // Express server for the Admin Panel
    var admin = express();

    // Set view engine for admin panel
    admin.set('view engine', 'ejs');
    admin.set('views', './admin/views');

    // Serve static files
    admin.use(express.static('./admin/static'));

    routes.setup(admin);

    // Start the Admin panel
    admin.listen(config.admin.port);
};