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
            else if (!req.file) {
                return cb({error: 'Please select an image to upload'});
            }
            else if (err instanceof multer.MulterError) {
                return cb({error: err});
            }
            else if (err) {
                return cb({error: err});
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
    }

};