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
var jwt = require('jsonwebtoken');
var request = require('request');
var semverCompare = require('semver/functions/gt');
var semverParse = require('semver/functions/parse');
var git = require('simple-git')();
var editJson = require("edit-json-file");

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

    uploadImage: (field, req, res, cb) => {
        var upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single(field);

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
        db.query(`INSERT INTO posts (title, image, body, cat, tags, author, date) VALUES ('${data.title}', '${data.image}', '${data.body}', '${data.category}', '${data.tags}', '${data.author}', '${Math.floor((new Date()).getTime() / 1000)}')`, (err, res) => {
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
                if(data.image) fs.unlink('./static' + config.website.uploads + '/' + data.image, (err) => {});
                cb({error: error});
                return;
            }
            db.query(`UPDATE posts SET title = '${data.title}', body = '${data.body}', cat = '${data.category}', tags = '${data.tags}', ` + (data.image ? `image = '${data.image}',` : ``) + ` author = '${data.author}', lastUpdated = '${Math.floor((new Date()).getTime() / 1000)}' WHERE id = ${data.id}`, (err, res) => {
                if(err) {
                    if(data.image) fs.unlink('./static' + config.website.uploads + '/' + data.image, (err) => {});
                    cb({error: err});
                    return;
                }
    
                if(data.image) {
                    fs.unlink('./static' + config.website.uploads + '/' + result[0].image, (err) => {
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
            fs.unlink('./static' + config.website.uploads + '/' + res[0].image, (err) => {
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
        db.query('SELECT * FROM posts WHERE ' + data.query + ' ORDER BY ' + (data.orderBy ? data.orderBy : 1), (err, res) => {
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

    update: (cb) => {
        git.pull('origin', 'main').then((result) => {
            var config = editJson('config.json');
            var updatefile = JSON.parse(fs.readFileSync('.updatefile', {encoding: 'utf8'}));
            config.set("version", updatefile.version);
            config.save(() => {
                cb({
                    result: result
                });
            });
        }).catch((err) => {
            cb({
                error: err
            })
        });
    }

};