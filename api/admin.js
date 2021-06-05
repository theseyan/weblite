/**
 * Admin API library
*/

var config = require('../config.json');
var helpers = require('./helpers');
var db = require('../db');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var storage = require('./storage').storage;
var createStorage = require('./storage').createStorage;
var jwt = require('jsonwebtoken');
var request = require('request');
var semverCompare = require('semver/functions/gt');
var semverParse = require('semver/functions/parse');
var git = require('simple-git')();
var editJson = require("edit-json-file");
var pm2 = require('pm2');
var exec = require('child_process').exec;

module.exports = {

    authenticateToken: (token, cb) => {
        jwt.verify(token, config.admin.authSecret, function(err, decoded) {
            if(err) {
                cb({error: err});
                return;
            }
            cb({userId: decoded.id, uname: decoded.sub});
        });
    },

    login: (data, cb) => {

        db.execute(`SELECT * FROM admin_users WHERE uname = ? AND password = ?`, [data.username, data.password], (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }

            if(res.length <= 0) {
                cb({error: 'No such user exists.'});
                return;
            }

            var token = jwt.sign({ sub: res[0].uname, id: res[0].id }, config.admin.authSecret, { expiresIn: '30d' });
            cb({
                token: token,
                user: res[0]
            });
        });

    },

    createTag: (data, cb) => {
        var path = "";
        function cont() {
            db.execute("INSERT INTO `tags` (`tag`, `label`, `description`, `path`) VALUES (?, ?, ?, ?)", [data.tag, data.label, data.description, path], (err, res) => {
                if(err) {
                    cb({error: err});
                    return;
                }
    
                cb({result: res});
            });
        }

        db.execute(`SELECT AUTO_INCREMENT as id FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`, [config.database.db, 'tags'], (err, res) => {
            var id = res[0].id;
            if(!data.parent || data.parent == "") {
                path = `/` + id;
                cont();
            }else {
                db.execute(`SELECT path FROM tags WHERE id = ?`, [data.parent], (err, res) => {
                    path = res[0].path + '/' + id;
                    cont();
                });
            }
        });
    },

    deleteTag: (id, cb) => {
        db.execute("SELECT path FROM tags WHERE id = ?", [id], (err, res) => {
            var path = res[0].path;
            db.execute("DELETE FROM `tags` WHERE `tags`.`id` = ?", [id], (err, res) => {
                if(err) {
                    cb({error: err});
                    return;
                }
    
                db.execute(`UPDATE tags SET path = CONCAT('/', id) WHERE path LIKE "${path}%"`, [], (err, res) => {
                    if(err) {
                        cb({error: err});
                        return;
                    }

                    cb({result: res});
                    global.updateVacanciesCounter();
                });
            });
        });
    },

    editTag: (data, cb) => {
        var path = "";
        var oldPath = "";
        function cont() {
            db.execute(`UPDATE tags SET path = REPLACE(path, ?, ?) WHERE path LIKE "${oldPath}%"`, [oldPath, path], (err, res) => {
                if(err) {
                    cb({error: err});
                    return;
                }

                db.execute("UPDATE `tags` SET `tag` = ?, `label` = ?, `description` = ?, `path` = ? WHERE `tags`.`id` = ?", [data.tag, data.label, data.description, path, data.id], (err, res) => {
                    if(err) {
                        cb({error: err});
                        return;
                    }
    
                    cb({result: res});
                    global.updateVacanciesCounter();
                });
            });   
        }

        db.execute(`SELECT path FROM tags WHERE id = ?`, [data.id], (err, res) => {
            oldPath = res[0].path;
            if(!data.parent || data.parent == "" || data.parent == data.id) {
                path = `/` + data.id;
                cont();
            }else {
                db.execute(`SELECT path FROM tags WHERE id = ?`, [data.parent], (err, res) => {
                    path = res[0].path + '/' + data.id;
                    cont();
                });
            }
        });
    },

    getTags: (q, cb) => {
        db.execute(`SELECT *, (SELECT CONCAT(id, '::', tag) FROM tags WHERE path = IF(REPLACE(t.path, CONCAT('/', t.id), '')="", CONCAT("/", t.id), REPLACE(t.path, CONCAT('/', t.id), '')) LIMIT 1) as parent FROM tags t WHERE ` + q, [], (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }
            cb({result: res});
        });
    },

    uploadImage: (field, req, res, cb, src) => {
        var upload = multer({ storage: typeof src=="undefined" ? storage : createStorage(src), fileFilter: helpers.imageFilter }).single(field);

        upload(req, res, function(err) {    
            if (req.fileValidationError) {
                return cb({error: req.fileValidationError});
            }
            else if (err instanceof multer.MulterError) {
                return cb({error: err});
            }
            else if (err) {
                return cb({error: err});
            }
            else if (!req.file) {
                return cb({error: 'Please select an image to upload'});
            }
    
            cb({
                req: req,
                res: res
            });
        });
    },

    createPost: (data, cb) => {
        var tags = data.tags.split(',');

        db.execute(`INSERT INTO posts (title, image, body, cat, author, date, lastDate, permalink, image_alt, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.title, data.image, data.body, data.category, data.author, Math.floor((new Date()).getTime() / 1000), data.lastDate, data.permalink, data.imageAlt, data.type], (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }

            var insertStr = "";
            tags.forEach(tag => {
                insertStr = insertStr + `(${tag}, ${res.insertId}),`;
            });
            insertStr = insertStr.substring(0, insertStr.length-1);
            
            db.execute(`INSERT INTO tagmap (tag_id, post_id) VALUES ${insertStr}`, [], (err, tagres) => {
                cb({result: res});
                global.updateVacanciesCounter();
            });
        });
    },

    editPost: (data, cb) => {
        var tags = data.tags.split(',');

        var update = () => {
            db.execute(`SELECT image FROM posts WHERE id = ?`, [data.id], (error, result) => {
                if(error) {
                    if(data.image) fs.unlink('.' + config.website.staticRoot + config.website.postImages + '/' + data.image, (err) => {});
                    cb({error: error});
                    return;
                }
                db.execute(`UPDATE posts SET title = ?, body = ?, cat = ?, ` + (data.image ? `image = '${data.image}',` : ``) + ` author = ?, lastUpdated = ?, lastDate = ?, permalink = ?, image_alt = ? WHERE id = ?`, [data.title, data.body, data.category, data.author, Math.floor((new Date()).getTime() / 1000), data.lastDate, data.permalink, data.imageAlt, data.id], (err, res) => {
                    if(err) {
                        if(data.image) fs.unlink('.' + config.website.staticRoot + config.website.postImages + '/' + data.image, (err) => {});
                        cb({error: err});
                        return;
                    }
        
                    if(data.image) {
                        fs.unlink('.' + config.website.staticRoot + config.website.postImages + '/' + result[0].image, (err) => {
                            if(err) {
                                cb({error: err});
                                return;
                            }
                            cb({result: res});
                        });
                    }else {
                        cb({result: res});
                    }
                });
            });
        }

        db.execute(`DELETE FROM tagmap WHERE post_id = ?`, [data.id], (err, deleteRes) => {
            if(err) {
                cb({error: err});
                return;
            }
            
            if(data.tags != '' && tags.length > 0) {
                var insertStr = "";
                tags.forEach(tag => {
                    insertStr = insertStr + `(${tag}, ${data.id}),`;
                });
                insertStr = insertStr.substring(0, insertStr.length-1);
                db.execute(`INSERT INTO tagmap (tag_id, post_id) VALUES ${insertStr}`, [], (err, tagres) => {
                    if(err) {
                        cb({error: err});
                        return;
                    }

                    update();
                    global.updateVacanciesCounter();
                });
            }else update();
        });
    },

    deletePost: (data, cb) => {
        db.execute(`SELECT image, id FROM posts WHERE id = ?`, [data.id], (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }

            db.execute(`DELETE FROM tagmap WHERE post_id = ?`, [res[0].id], (err, deleteRes) => {
                if(err) {
                    cb({error: err});
                    return;
                }

                // Delete image file
                fs.unlink('.' + config.website.staticRoot + config.website.postImages + '/' + res[0].image, (err) => {
                    if(err) {
                        cb({error: err});
                        return;
                    }

                    // Delete the post
                    db.execute(`DELETE FROM posts WHERE id = ?`, [data.id], (err, res) => {
                        if(err) {
                            cb({error: err});
                            return;
                        }

                        cb({
                            result: res
                        });
                    });
                });
            });
        });
        global.updateVacanciesCounter();
    },

    getPosts: (data, cb) => {
        var q = data.query ? data.query : 1;
        if(data.tags && data.tags.length > 0) {
            var tags = "'" + data.tags.join("','") + "'";
            var strict = data.strictTags ? data.strictTags : false;
            var query = `SELECT ${(data.select ? data.select : 'post.*')}, (SELECT GROUP_CONCAT(t.id, ":", t.tag) FROM tagmap tm, tags t WHERE tm.post_id = post.id AND tm.tag_id = t.id) AS tags FROM tagmap tm, posts post, tags t WHERE tm.tag_id = t.id AND (t.tag IN (${tags}) OR t.path LIKE CONCAT((SELECT path FROM tags WHERE tag IN (${tags})), "%")) AND post.id = tm.post_id AND (${(data.type ? (`post.type = "${data.type}" AND `) : '')} ${q}) GROUP BY post.id ${strict==true ? ('HAVING COUNT( post.id )='+data.tags.length) : ''} ORDER BY ${(data.orderBy ? data.orderBy : 1)} ${(data.limit ? " LIMIT " + data.limit : "")}`;
        }else {
            var query = 'SELECT ' + (data.select ? data.select : 'post.*') + ', (SELECT GROUP_CONCAT(t.id, ":", t.tag) FROM tagmap tm, tags t WHERE tm.post_id = post.id AND tm.tag_id = t.id) AS tags FROM posts post WHERE ' + (data.type ? (`post.type = "${data.type}" AND `) : '') + `(${q})` + ' ORDER BY ' + (data.orderBy ? data.orderBy : 1);
        }
        db.execute(query, [], (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }
            cb({posts: res});
        });
    },

    checkUpdates: (cb) => {
        var repo = config.update.repo.split("/").reverse();
        var updateFile = "https://raw.githubusercontent.com/" + repo[1] + "/" + repo[0] + "/master/.updatefile";
        request.get(updateFile, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                
                var updateObj = JSON.parse(body);

                if(semverCompare(updateObj.version, config.version) === true) {
                    var remote = semverParse(updateObj.version);
                    var local = semverParse(config.version);
                    var type = 'PATCH';
                    
                    if(remote.major > local.major) type = 'MAJOR';
                    else if(remote.minor > local.minor) type = 'MINOR';

                    cb({
                        update: true,
                        type: type,
                        body: updateObj
                    });
                }else {
                    cb({
                        update: false
                    });
                }

            }else {
                cb({
                    error: !error ? "Status Code " + response.statusCode : error
                });
            }
        });
    },

    update: (cb, async) => {
        pm2.connect(function(err) {

            if (err) {
                cb({
                    error: err
                });
                return;
            }
            
            git.fetch(['--all']).reset('hard', ['origin/main']).then((result) => {
                var cmd = 'npm install';

                exec(cmd, function(error, stdout, stderr) {
                    if(error) {
                        cb({
                            error: error
                        });
                        return;
                    }

                    var config = editJson('config.json');
                    var updatefile = JSON.parse(fs.readFileSync('.updatefile', {encoding: 'utf8'}));
                    config.set("version", updatefile.version);
                    config.save(() => {

                        var reload = () => {
                            pm2.reload('server', function(err) {
                                pm2.disconnect();
                                if (err) {
                                    throw err;
                                }
                            });
                        };
                        if(typeof async!="undefined" && async === true) {
                            cb({
                                result: result,
                                reload: reload
                            });
                        }else {
                            cb({
                                result: result
                            });
                            reload();
                        }

                    });
                });
            }).catch((err) => {
                cb({
                    error: err
                })
            });

        });
    },

    getSystemStatus: (cb) => {
        var checks = {};
        var totalChecks = 4;

        function check(name, val) {
            checks[name] = val;
            if(Object.keys(checks).length >= totalChecks) cb(checks);
        }

        // Check SITE status
        request(config.website.root, function (err, res, body) {
            if(err) {
                check('site', 'offline');
                return;
            }

            if(res.statusCode < 500) {
                check('site', 'online');
            }else {
                check('site', 'HTTP_CODE_' + res.statusCode);
            }
        });

        // Check ADMIN PANEL status
        request(config.admin.root, function (err, res, body) {
            if(err) {
                check('admin', 'offline');
                return;
            }

            if(res.statusCode < 500) {
                check('admin', 'online');
            }else {
                check('admin', 'HTTP_CODE_' + res.statusCode);
            }
        });

        // Check API status
        request(config.api.root, function (err, res, body) {
            if(err) {
                check('api', 'offline');
                return;
            }

            if(res.statusCode < 500) {
                check('api', 'online');
            }else {
                check('api', 'HTTP_CODE_' + res.statusCode);
            }
        });

        // Check MySQL database status
        db.query('SELECT NULL LIMIT 0', (err, res) => {
            if(err) {
                check('database', 'offline');
                return;
            }
            check('database', 'online');
        });

    },

    editCollection: (file, collection, newCollection, cb) => {
        var collections = editJson(file);
        collections.set(collection, newCollection);
        collections.save(() => {
            cb({});
        });
    },

    setCollections: (file, newCollection, cb) => {
        fs.writeFile(file, newCollection, 'utf-8', (err, data) => {
            if (err) {
                cb({
                    error: err
                });
                return;
            }
            cb({data: data});
        });

    },

    deleteCollection: (file, collection, cb) => {
        var collections = editJson(file);
        collections.unset(collection);
        collections.save(() => {
            cb({});
        });
    },

    getCollections: (cb) => {
        cb({collections: global.Data.Collections});
    },

    getMediaFiles: (dir, cb) => {
        var data = [];
        fs.readdir(dir, (err, files) => {
            if(err) {
                cb({
                    error: err
                });
                return;
            }

            files.forEach((file) => {
                var filePath = path.join(dir, file);
                var stat = fs.statSync(filePath);

                data.push(stat.isDirectory() ? {
                    file: file,
                    dir: stat.isDirectory()
                } : {
                    file: file
                });
            });

            cb({
                files: data
            });
        });
    },

    deleteFile: (src, cb) => {
        // Delete image file
        fs.unlink(src, (err) => {
            if(err) {
                cb({error: err});
                return;
            }
            cb({});
        });
    },

};