/**
 * thejoblistr
 * Server core script
 * @author Sayanjyoti Das
*/

var config = require('./config.json');
var express = require('express');
var routes = require('./src/routes');

// Express server for the Frontend Website
var app = express();

// Express server for the Admin Panel
var admin = express();

// Set view engine for frontend
app.set('view engine', 'ejs');

// Set view engine for admin panel
admin.set('view engine', 'ejs');
admin.set('views', './admin/views');

// Serve static files
app.use(express.static('static'));
admin.use(express.static('admin/static'));

// Set up routes
routes.setup(app, admin);

// Start the Frontend server on port 8080
app.listen(config.frontendPort);

// Start the Admin panel on port 7080
admin.listen(config.adminPort);