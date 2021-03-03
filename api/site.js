/**
 * Site API library
*/

var config = require('../config.json');
var db = require('../db');

module.exports = {

    getPosts: (data, cb) => {
        db.query('SELECT * FROM posts WHERE ' + data.query + ' ORDER BY ' + (data.orderBy ? data.orderBy : 1) + (data.limit ? " LIMIT " + data.limit : ""), (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }

            res.forEach((post) => {
                var time = new Date(Number(post.date)*1000).toGMTString();
                var lastDate = new Date(Number(post.lastDate)*1000).toDateString();
                post.dateString = time;
                post.lastDateString = lastDate;
            });

            cb({posts: res});
        });
    }

};