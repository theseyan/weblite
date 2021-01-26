var admin = require('../admin');
var config = require('../../config.json');

module.exports = {

    type: 'post',

    route: '/admin/createPost',

    handle: (req, res) => {

        // Upload post image
        admin.uploadImage('image', req, res, (data) => {
            if(data.error) {
                res.status(500).send({
                    message: 'Failed to upload image from post'
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
                category: req.body.cat
            }, (data) => {
                if(data.error) {
                    res.status(500).send({
                        message: 'Failed to create post'
                    });
                    return;
                }
    
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