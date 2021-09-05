/**
 * Initialization module for REST API
*/

var config = require('../config.json');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var routes = require('./routes');

module.exports = () => {
    // Express server for API
    var api = express();

    // Support JSON and URLEncoded API requests
    api.use(bodyParser.json());
    api.use(bodyParser.urlencoded({
        extended: true
    })); 
    api.use(cors());

    routes.setup(api);

    // Start the API server
    api.listen(config.api.port);
};