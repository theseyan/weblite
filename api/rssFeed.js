var {Feed} = require('feed');
var siteApi = require('./site');
var config = require('../config.json');
var {escape} = require('html-escaper');

const feed = new Feed({
    title: "theJobListr",
    description: "Get new job listings delivered directly to your feed everyday!",
    id: config.website.root,
    link: config.website.root,
    language: "en",
    image: config.website.root + "/images/logo-full-whitebg.png",
    favicon: config.website.root + "/images/logo-min-transparentbg.png",
    copyright: "All rights reserved " + (new Date().getFullYear()) + ", theJobListr",
    generator: "weblite RSS",
    feedLinks: {
        //json: "https://example.com/json",
        //atom: "https://example.com/atom"
    },
    author: {
        name: "theJobListr Team",
        email: "contact@thejoblistr.com",
        link: config.website.root
    }
});

module.exports = {
    generateFeed: (type, data, cb) => {
        siteApi.getPosts(data, (result) => {
            if(result.error) {
                cb({
                    error: result.error
                });
                return;
            }

            result.posts.forEach(post => {
                feed.addItem({
                    title: post.title,
                    id: config.website.root + '/post/' + post.id,
                    link: config.website.root + '/post/' + post.id,
                    description: escape(post.body.length > 500 ? post.body.substring(0, 500) + ' [...continued]' : post.body),
                    content: "A new post published by theJobListr.",
                    author: [
                    {
                        name: post.author,
                        email: "contact@thejoblistr.com",
                        link: config.website.root
                    }
                    ],
                    contributor: [],
                    date: new Date(post.date * 1000),
                    image: config.website.root + config.website.postImages + post.image
                });
            });

            if(type == 'rss2') {
                cb({
                    feed: feed.rss2()
                });
            }
            else if(type == 'atom1') {
                cb({
                    feed: feed.atom1()
                });
            }
            else if(type == 'json1') {
                cb({
                    feed: feed.json1()
                });
            }
        });
    }
}