/**
 * thejoblistr
 * Server core script
 * @author Sayanjyoti Das
*/

require('dotenv').config();
var config = require('./config.json');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var routes = require('./src/routes');
var adminRoutes = require('./admin/routes');
var apiRoutes = require('./api/routes');

// Express server for the Frontend Website
var app = express();

// Express server for the Admin Panel
var admin = express();

// Express server for API
var api = express();

// Support JSON and URLEncoded API requests
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: true
})); 
api.use(cors());

// Set view engine for frontend
app.set('view engine', 'ejs');

// Set view engine for admin panel
admin.set('view engine', 'ejs');
admin.set('views', './admin/views');

// Serve static files
app.use(express.static('static'));
admin.use(express.static('admin/static'));

// Set up routes
routes.setup(app);
adminRoutes.setup(admin);
apiRoutes.setup(api);

// Start the Frontend server
app.listen(config.website.port);

// Start the Admin panel
admin.listen(config.admin.port);

// Start the API server
api.listen(config.api.port);