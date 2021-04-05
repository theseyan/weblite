var admin = require('../admin');
var config = require('../../config.json');
var onesignal = require('onesignal-node');   

module.exports = {

    type: 'post',

    route: '/admin/createPost',

    handle: (req, res) => {

        // Upload post image
        admin.uploadImage('image', req, res, (data) => {
            if(data.error) {
                res.status(500).send({
                    message: 'Failed to upload image from post',
                    error: data.error
                });
                return;
            }

            // Create the bare post
            admin.createPost({
                title: req.body.title,
                image: req.file.filename,
                body: req.body.body,
                tags: req.body.tags,
                author: req.body.author,
                category: req.body.cat,
                permalink: req.body.permalink,
                lastDate: Number(req.body.lastDate),
                imageAlt: req.body.imageAlt
            }, (data) => {
                if(data.error) {
                    res.status(500).send({
                        message: 'Failed to create post',
                        error: data.error
                    });
                    return;
                }

                /**
                 * Send push notifications
                */
                var client = new onesignal.Client(config.keys.onesignalAppId, config.keys.onesignalApiKey);

                var notification = { 
                    headings: {"en": req.body.title},
                    contents: {"en": "Don't miss out on the latest job postings!"},
                    web_url: config.website.root + '/post/' + data.result.insertId,
                    big_picture: config.website.root + config.website.postImages + '/' + req.file.filename,
                    chrome_web_image: config.website.root + config.website.postImages + '/' + req.file.filename,
                    ios_attachments: {"1": config.website.root + config.website.postImages + '/' + req.file.filename},
                    included_segments: ["Subscribed Users"]
                };

                client.createNotification(notification).then(response => {}).catch(e => {
                    console.error(e);
                });

                if(req.body.redirect) {
                    res.redirect(req.body.redirect);
                    return;
                }else {
                    res.status(200).send({
                        message: 'Post was created successfully'
                    });
                }
            });
        });

    }

};