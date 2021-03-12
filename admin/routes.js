var config = require('../config.json');
var mainMenu = require('./data/menu.json');
var adminApi = require('../api/admin');

var data = (req, res) => {
    return {
        url: req.url,
        config: config,
        menus: {
            main: mainMenu
        },
        auth: req.auth,
        v2: config.admin.root
    };
};

module.exports = {

    setup: (admin) => {

        admin.get('/', function(req, res) {
            res.render(require.resolve('./index.ejs'), data(req, res));
        });

        // Login Page
        admin.get('/login', function (req, res) {
            res.render(require.resolve('./login.ejs'), data(req, res));
        })

        // Authenticate Login Page
        admin.get('/authenticate/token/:token', function(req, res) {
            adminApi.authenticateToken(req.params.token, (data) => {
                if(data.error || !data.userId) {
                    res.status(401).send({
                        message: 'Access token could not be verified'
                    });
                    return;
                }

                res.status(200).send({
                    message: 'Access token verified'
                });
                return;
            });
        });

    }

};