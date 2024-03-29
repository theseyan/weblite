var config = require('../config.json');
var api = require('../api/site');
var feed = require('../api/rssFeed');

var data = (req, res) => {
    var collections = global.Data.Collections;
    var menus = collections.menus;
    var indianStates = collections.subMenus.indianStates;
    var jobs = collections.subMenus.jobs;
    var mainMenu = menus.main.MainMenu;
    var footerMenu = menus.main.footer;
    var sidebarMenu = collections.sidebar.latestNotifications;
    var vacancies = global.Vacancies;

    return {
        vacancies: vacancies,
        config: config.website,
        menus: {
            main: mainMenu,
            indianStates: indianStates,
            footer: footerMenu,
            cards: collections.homepageCards.cards,
            orgs: collections.homepageOrgs,
            jobs: jobs,
            sidebar: sidebarMenu
        },
        url: req.url
    };
};

module.exports = {

    setup: (app) => {

        // RSS Feed
        app.get('/feeds/:type', function(req, res) {
            var feeds = {rss: ["rss2", "application/xml"], json: ["json1", "application/json"]};
            if(feeds.hasOwnProperty(req.params.type) !== true) return res.status(404).end();

            feed.generateFeed(feeds[req.params.type][0], {
                query: `1`,
                orderBy: 'date DESC',
                limit: 10
            }, (data) => {
                if(data.error) {
                    res.status(500).end();
                    return;
                }

                res.type(feeds[req.params.type][1]);
                res.send(data.feed);
            });
        });

        // Subscribe Page
        app.get('/subscribe', function(req, res) {
            res.render('pages/subscribe', data(req, res));
        });

        // Home Page
        app.get('/', function(req, res) {
            var results = {};
            function add(name, result) {
                if(result.error) {
                    res.send('An error occurred.');
                    return;
                }
                results[name] = result;

                if(Object.keys(results).length >= 6) {
                    res.render('pages/index', Object.assign(data(req, res), {posts: results}));
                }
            }
            /*api.getPosts({
                tags: ['government'],
                orderBy: 'post.date DESC',
                limit: 10
            }, (result) => add('government', result));*/

            api.getPosts({
                query: 1,
                orderBy: 'post.date DESC',
                limit: 10
            }, (result) => add('latest', result));

            api.getPosts({
                tags: ['state'],
                orderBy: 'post.date DESC',
                limit: 10
            }, (result) => add('state', result));

            api.getPosts({
                tags: ['exam'],
                orderBy: 'post.date DESC',
                limit: 10
            }, (result) => add('exams', result));

            api.getPosts({
                tags: ['admit-cards'],
                orderBy: 'post.date DESC',
                limit: 10
            }, (result) => add('admitCards', result));

            api.getPosts({
                tags: ['syllabus'],
                orderBy: 'post.date DESC',
                limit: 10
            }, (result) => add('syllabus', result));

            api.getPosts({
                tags: ['answer-keys'],
                orderBy: 'post.date DESC',
                limit: 10
            }, (result) => add('answerKeys', result));
        });

        // View Post Page
        app.get('/post/:id', function(req, res) {
            api.getPosts({
                query: `post.id = '${req.params.id}' OR post.permalink = '${req.params.id}'`
            }, (result) => {
                if(result.error) {
                    console.log(result.error);
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
            var config = req.params.t=='all' ? {
                query: 1,
                orderBy: 'date DESC'
            } : {
                tags: [req.params.t],
                orderBy: 'date DESC'
            };
            api.getPosts(config, (result) => {
                res.render('pages/posts', Object.assign(data(req, res), {
                    tag: req.params.t,
                    posts: result.posts,
                    label: req.params.t=='all' ? "Jobs: " : "Jobs tagged "
                }));
            });
        });

        // States Page
        app.get('/state/:state', function(req, res) {
            api.getPosts({
                tags: [req.params.state],
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
                query: `title LIKE '%${req.params.q}%' OR cat LIKE '%${req.params.q}%'`,
                orderBy: 'date DESC'
            }, (result) => {
                res.render('pages/search', Object.assign(data(req, res), {
                    query: req.params.q,
                    posts: result.posts
                }));
            });
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