/**
 * Site API library
*/

var config = require('../config.json');
var db = require('../db');

module.exports = {

    getPosts: (data, cb) => {
        var q = data.query ? data.query : 1;
        if(!data.type) data.type = 'public';
        if(data.tags && data.tags.length > 0) {
            var tags = "'" + data.tags.join("','") + "'";
            var strict = data.strictTags ? data.strictTags : false;
            var query = `SELECT ${(data.select ? data.select : 'post.*')}, (SELECT GROUP_CONCAT(t.id, ":", t.tag) FROM tagmap tm, tags t WHERE tm.post_id = post.id AND tm.tag_id = t.id) AS tags FROM tagmap tm, posts post, tags t WHERE tm.tag_id = t.id AND (t.tag IN (${tags}) OR t.path LIKE CONCAT((SELECT path FROM tags WHERE tag IN (${tags})), "%")) AND post.id = tm.post_id AND (${(data.type ? (`post.type = "${data.type}" AND `) : '')} ${q}) GROUP BY post.id ${strict==true ? ('HAVING COUNT( post.id )='+data.tags.length) : ''} ORDER BY ${(data.orderBy ? data.orderBy : 1)} ${(data.limit ? " LIMIT " + data.limit : "")}`;
        }else {
            var query = 'SELECT ' + (data.select ? data.select : 'post.*') + ', (SELECT GROUP_CONCAT(t.id, ":", t.tag) FROM tagmap tm, tags t WHERE tm.post_id = post.id AND tm.tag_id = t.id) AS tags FROM posts post WHERE ' + (data.type ? (`post.type = "${data.type}" AND `) : '') + `(${q})` + ' ORDER BY ' + (data.orderBy ? data.orderBy : 1) + (data.limit ? " LIMIT " + data.limit : "");
        }
        db.execute(query, [], (err, res) => {
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
    },

};

global.Vacancies = {};

global.updateVacanciesCounter = () => {
    var states = global.Data.Collections.subMenus.indianStates;
    function add(id, total) {
        global.Vacancies[id] = total;
    }

    for(var id in states) {
        (function(id) {
            db.query(`SELECT COUNT(*) as total FROM tagmap tm, posts post, tags t WHERE tm.tag_id = t.id AND (t.tag = '${id}' OR t.path LIKE CONCAT((SELECT path FROM tags WHERE tag = '${id}'), "%")) AND post.id = tm.post_id`, (err, res) => {
                add(id, res[0].total);
            });
        })(id);
    }
};
global.updateVacanciesCounter();