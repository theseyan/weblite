var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/admin/deletePost',

    handle: (req, res) => {
        admin.deletePost({
            id: req.body.id
        }, (data) => {
            if(data.error) {
                res.status(500).send({
                    message: 'Failed to delete post',
                    error: data.error
                });
                return;
            }

            if(req.body.redirect) {
                res.redirect(req.body.redirect);
                return;
            }else {
                res.status(200).send({
                    message: 'Deleted post successfully'
                });
            }
        });
    }

};