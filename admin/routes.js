var config = require('../config.json');
var mainMenu = require('./data/menu.json');
var adminApi = require('../api/admin');
var cookie = require('cookies');
var authMiddleware = require('./authMiddleware').middleware;

var data = (req, res) => {
    return {
        url: req.url,
        config: config,
        menus: {
            main: mainMenu
        },
        auth: req.auth
    };
};

module.exports = {

    setup: (admin) => {

        admin.use(authMiddleware);

        // Administration Home Page
        admin.get('/', function(req, res) {
            res.render('pages/index', data(req, res));
        });

        // Login Page
        admin.get('/login', function (req, res) {
            res.render('pages/login', data(req, res));
        })

        // Create Post Page
        admin.get('/createPost', function(req, res) {
            res.render('pages/createPost', data(req, res));
        });

        // Manage Posts Page
        admin.get('/managePosts', function(req, res) {
            adminApi.getPosts({
                query: '1',
                orderBy: 'date DESC'
            }, (result) => {
                if(result.error) {
                    res.send('An error occurred.');
                    return;
                }
                res.render('pages/managePosts', Object.assign(data(req, res), {posts: result.posts}));
            });
        });

        // Edit Post Page
        admin.get('/editPost/:id', function(req, res) {
            adminApi.getPosts({
                query: 'id = ' + req.params.id,
                orderBy: '1'
            }, (result) => {
                if(result.error) {
                    res.send('An error occurred.');
                    return;
                }
                res.render('pages/editPost', Object.assign(data(req, res), {post: result.posts[0]}));
            });
        });

        // Delete Post Page
        admin.get('/deletePost/:id', function(req, res) {
            res.render('pages/deletePost', Object.assign(data(req, res), {postId: req.params.id}));
        });

        // Authenticate Login Page
        admin.get('/authenticate/token/:token', function(req, res) {
            var cookies = new cookie(req, res);
            adminApi.authenticateToken(req.params.token, (data) => {
                if(data.error || !data.userId) {
                    res.redirect(config.admin.root + '/login?failure');
                    return;
                }

                cookies.set('authToken', req.params.token);
                cookies.set('authUser', data.uname);
                res.redirect(config.admin.root);
                return;
            });
        });

        // Logout Page
        admin.get('/logout', function(req, res) {
            var cookies = new cookie(req, res);
            cookies.set('authToken');
            cookies.set('authUser');
            
            res.redirect(config.admin.root + '/login');
            return;
        });

        // Update Page
        admin.get('/system/update', function(req, res) {
            adminApi.checkUpdates((rdata) => {
                if(rdata.error) {
                    res.send("Error: " + rdata.error);
                    return;
                }

                res.render('pages/update', Object.assign(data(req, res), {update: rdata}));
            });
        });

        // Collections Page
        admin.get('/collections', function(req, res) {
            var collections = require('../site/src/data/Collections.json');
            res.render('pages/collections', Object.assign(data(req, res), {
                collections: collections,
                label: 'Collections'
            }));
        });

    }

};