var admin = require('../admin');
var config = require('../../config.json');
var onesignal = require('onesignal-node');   

var notifyOneSignal = (id, permalink, title, image) => {
    var client = new onesignal.Client(config.keys.onesignalAppId, config.keys.onesignalApiKey);

    var notification = { 
        headings: {"en": title},
        contents: {"en": "Don't miss out on the latest job postings!"},
        web_url: config.website.root + '/post/' + ((permalink=="" || !permalink) ? id : permalink),
        big_picture: config.website.root + config.website.postImages + '/' + image,
        chrome_web_image: config.website.root + config.website.postImages + '/' + image,
        ios_attachments: {"1": config.website.root + config.website.postImages + '/' + image},
        included_segments: ["Subscribed Users"]
    };

    /*client.createNotification(notification).then(response => {}).catch(e => {
        console.error(e);
    });*/
};

module.exports = {

    type: 'post',

    route: '/admin/createPost',

    handle: (req, res) => {

        // Create Post from existing Draft
        if(/*req.body.id*/true===false) {
            admin.getPosts({
                query: `id = '${req.body.id}'`
            }, (result) => {
                if(result.error) {
                    res.status(500).send({
                        message: 'Failed to fetch draft',
                        error: result.error
                    });
                    return;
                }

                var draft = result.posts[0];

                admin.createPost({
                    title: draft.title,
                    image: draft.image,
                    body: draft.body,
                    tags: draft.tags,
                    author: draft.author,
                    category: draft.cat,
                    permalink: draft.permalink,
                    lastDate: Number(draft.lastDate),
                    imageAlt: draft.image_alt,
                    type: 'public'
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
                    notifyOneSignal(data.result.insertId, draft.permalink, draft.title, draft.image);

                });
            });
        }

        // Create Post from scratch
        else {
            // Upload post image
            admin.uploadImage('image', req, res, (data) => {
                if(data.error) {
                    res.status(500).send({
                        message: 'Failed to upload image from post',
                        error: data.error
                    });
                    return;
                }

                var type = req.body.type ? req.body.type : 'public';

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
                    imageAlt: req.body.imageAlt,
                    type: type
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
                    if(type == 'public') notifyOneSignal(data.result.insertId, req.body.permalink, req.body.title, req.file.filename);

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

    }

};