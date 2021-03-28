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

        db.query(`SELECT * FROM admin_users WHERE uname = '${data.username}' AND password = '${data.password}'`, (err, res) => {
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
        db.query(`INSERT INTO posts (title, image, body, cat, tags, author, date, lastDate) VALUES ('${data.title}', '${data.image}', '${data.body}', '${data.category}', '${data.tags}', '${data.author}', '${Math.floor((new Date()).getTime() / 1000)}', '${data.lastDate}')`, (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }

            cb({result: res});
        });
    },

    editPost: (data, cb) => {
        db.query(`SELECT image FROM posts WHERE id = ${data.id}`, (error, result) => {
            if(error) {
                if(data.image) fs.unlink('.' + config.website.staticRoot + config.website.uploads + '/' + data.image, (err) => {});
                cb({error: error});
                return;
            }
            db.query(`UPDATE posts SET title = '${data.title}', body = '${data.body}', cat = '${data.category}', tags = '${data.tags}', ` + (data.image ? `image = '${data.image}',` : ``) + ` author = '${data.author}', lastUpdated = '${Math.floor((new Date()).getTime() / 1000)}', lastDate = '${data.lastDate}' WHERE id = ${data.id}`, (err, res) => {
                if(err) {
                    if(data.image) fs.unlink('.' + config.website.staticRoot + config.website.uploads + '/' + data.image, (err) => {});
                    cb({error: err});
                    return;
                }
    
                if(data.image) {
                    fs.unlink('.' + config.website.staticRoot + config.website.uploads + '/' + result[0].image, (err) => {
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
    },

    deletePost: (data, cb) => {
        db.query(`SELECT image FROM posts WHERE id = ${data.id}`, (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }

            // Delete image file
            fs.unlink('.' + config.website.staticRoot + config.website.uploads + '/' + res[0].image, (err) => {
                if(err) {
                    cb({error: err});
                    return;
                }

                // Delete the post
                db.query(`DELETE FROM posts WHERE id = ${data.id}`, (err, res) => {
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
    },

    getPosts: (data, cb) => {
        db.query('SELECT ' + (data.select ? data.select : '*') + ' FROM posts WHERE ' + data.query + ' ORDER BY ' + (data.orderBy ? data.orderBy : 1), (err, res) => {
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
    }

};