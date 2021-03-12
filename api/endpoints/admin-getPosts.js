var admin = require('../admin');
var config = require('../../config.json');

module.exports = {

    type: 'post',

    route: '/admin/getPosts',

    handle: (req, res) => {

        var params = req.query.id ? {
            query: 'id = ' + req.query.id
        } : {
            select: 'id, title, image, cat, author',
            query: '1',
            orderBy: 'date DESC'
        };

        // Create the bare post
        admin.getPosts(params, (result) => {
            if(result.error) {
                res.status(500).send({
                    message: 'Failed to get posts',
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: 'Fetched posts successfully',
                posts: JSON.stringify(result.posts)
            });
        });

    }

};