var config = require('../config.json');
var fs = require('fs');
var authMiddleware = require('./authMiddleware').middleware;

module.exports = {

    setup: (api) => {

        api.use(authMiddleware);

        // Load all endpoints
        const endpoints = fs.readdirSync('./api/endpoints').filter(file => file.endsWith('.js'));
        for (const file of endpoints) {
            const endpoint = require(`./endpoints/${file}`);

            // Register the API endpoint
            api[endpoint.type](endpoint.route, endpoint.handle);
        }

    }

};