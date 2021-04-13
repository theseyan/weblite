/**
 * Site API library
*/

var config = require('../config.json');
var db = require('../db');

module.exports = {

    getPosts: (data, cb) => {
        db.query('SELECT * FROM posts WHERE type = "public" AND (' + data.query + ') ORDER BY ' + (data.orderBy ? data.orderBy : 1) + (data.limit ? " LIMIT " + data.limit : ""), (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }

            res.forEach((post) => {
                var postDate = new Date(Number(post.date)*1000);
                var lastDate = new Date(Number(post.lastDate)*1000);

                post.dateStringMin = postDate.getDate() + '/' + (postDate.getMonth()+1) + '/' + postDate.getFullYear();
                post.lastDateStringMin = lastDate.getDate() + '/' + (lastDate.getMonth()+1) + '/' + lastDate.getFullYear();
                post.dateString = postDate.toGMTString();
                post.lastDateString = lastDate.toDateString();
                post.link = (post.permalink && post.permalink != "") ? post.permalink : post.id;
            });

            cb({posts: res});
        });
    }

};

global.Vacancies = {};
var states = global.Data.Collections.subMenus.indianStates;

function add(id, total) {
    global.Vacancies[id] = total;
}

for(var id in states) {
    (function(id) {
        db.query("SELECT COUNT(*) AS total FROM posts WHERE tags LIKE '%" + id + "%'", (err, res) => {
            add(id, res[0].total);
        });
    })(id);
}