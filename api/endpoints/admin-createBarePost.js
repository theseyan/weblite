var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/admin/createBarePost',

    handle: (req, res) => {
        /*
        admin.createPost({
            title: req.body.title,
            image: req.body.image,
            body: req.body.body,
            tags: req.body.tags,
            author: req.body.author
        }, (data) => {
            if(data.error) {
                res.status(500).send({
                    message: 'Failed to create post'
                });
                return;
            }

            res.status(200).send({
                message: 'Post was created successfully'
            });
        });
        */
    }

};