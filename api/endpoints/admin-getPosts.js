var admin = require('../admin');
var config = require('../../config.json');

module.exports = {

    type: 'get',

    route: '/admin/getPosts',

    handle: (req, res) => {
        var type = req.query.type ? req.query.type : null;

        var params = req.query.id ? {
            query: `id = '${req.query.id}'`,
            type: type
        } : {
            select: 'id, title, image, cat, author',
            query: '1',
            orderBy: 'date DESC',
            type: type
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