var admin = require('../admin');
var config = require('../../config.json');
var multerStorage = require('../storage').reqStorage;
var helpers = require('../helpers');
var multer = require('multer')({ storage: multerStorage, fileFilter: helpers.imageFilter });

module.exports = {

    type: 'post',

    route: '/admin/uploadImage',

    handle: (req, res) => {
        
        var upload = multer.single('image');
        upload(req, res, (err) => {
            var body = req.body;

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
            }, config.website.staticRoot + body.path);
        });

    }

};