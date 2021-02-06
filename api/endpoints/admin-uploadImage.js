var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/admin/uploadImage',

    handle: (req, res) => {
        admin.uploadImage('image', req, res, (data) => {
            if(data.error) {
                res.status(500).send({
                    message: 'Failed to upload image',
                    error: data.error
                });
                return;
            }

            if(req.body.redirect) {
                res.redirect(req.body.redirect);
                return;
            }else {
                res.status(200).send({
                    message: 'Uploaded image successfully'
                });
            }
        });
    }

};