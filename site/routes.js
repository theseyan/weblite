var config = require('../config.json');
var menus = require('./src/data/Menus.json');
var collections = require('./src/data/Collections.json');
var indianStates = collections.subMenus.indianStates;
var jobs = collections.subMenus.jobs;
var mainMenu = menus.main.MainMenu;
var footerMenu = menus.footer;

var api = require('../api/site');

var data = (req, res) => {
    return {
        config: config.website,
        menus: {
            main: mainMenu,
            indianStates: indianStates,
            footer: footerMenu,
            cards: collections.homepageCards.cards,
            orgs: collections.homepageOrgs,
            jobs: jobs
        },
        url: req.url
    };
};

module.exports = {

    setup: (app) => {

        // Home Page
        app.get('/', function(req, res) {
            var results = {};
            function add(name, result) {
                if(result.error) {
                    res.send('An error occurred.');
                    return;
                }
                results[name] = result;

                if(Object.keys(results).length >= 7) {
                    res.render('pages/index', Object.assign(data(req, res), {posts: results}));
                }
            }
            api.getPosts({
                query: "tags LIKE '%government%'",
                orderBy: 'date DESC',
                limit: 3
            }, (result) => add('government', result));

            api.getPosts({
                query: 1,
                orderBy: 'date DESC',
                limit: 8
            }, (result) => add('latest', result));

            api.getPosts({
                query: "tags LIKE '%state%'",
                orderBy: 'date DESC',
                limit: 3
            }, (result) => add('state', result));

            api.getPosts({
                query: "tags LIKE '%exam%'",
                orderBy: 'date DESC',
                limit: 3
            }, (result) => add('exams', result));

            api.getPosts({
                query: "tags LIKE '%admit-cards%'",
                orderBy: 'date DESC',
                limit: 3
            }, (result) => add('admitCards', result));

            api.getPosts({
                query: "tags LIKE '%syllabus%'",
                orderBy: 'date DESC',
                limit: 3
            }, (result) => add('syllabus', result));

            api.getPosts({
                query: "tags LIKE '%answer-keys%'",
                orderBy: 'date DESC',
                limit: 3
            }, (result) => add('answerKeys', result));
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

        // Posts Page
        app.get('/posts/:t', function(req, res) {
            api.getPosts({
                query: `tags LIKE '%${req.params.t}%'`,
                orderBy: 'date DESC'
            }, (result) => {
                res.render('pages/posts', Object.assign(data(req, res), {
                    tag: req.params.t,
                    posts: result.posts,
                    label: "Jobs tagged "
                }));
            });
        });

        // States Page
        app.get('/state/:state', function(req, res) {
            api.getPosts({
                query: `tags LIKE '%${req.params.state}%'`,
                orderBy: 'date DESC'
            }, (result) => {
                res.render('pages/posts', Object.assign(data(req, res), {
                    tag: req.params.state,
                    posts: result.posts,
                    label: "Jobs in "
                }));
            });
        });

        // Search Page
        app.get('/search/:q', function(req, res) {
            api.getPosts({
                query: `title LIKE '%${req.params.q}%' OR cat LIKE '%${req.params.q}%' OR tags LIKE '%${req.params.q}%'`,
                orderBy: 'date DESC'
            }, (result) => {
                res.render('pages/search', Object.assign(data(req, res), {
                    query: req.params.q,
                    posts: result.posts
                }));
            });
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

        // Privacy Policy Page
        app.get('/privacypolicy', function(req, res) {
            res.render('pages/privacypolicy', data(req, res));
        });

    }

}