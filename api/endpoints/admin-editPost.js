var admin = require('../admin');
var multerStorage = require('../storage').storage;
var helpers = require('../helpers');
var multer = require('multer')({ storage: multerStorage, fileFilter: helpers.imageFilter });

module.exports = {

    type: 'post',

    route: '/admin/editPost',

    handle: (req, res) => {

        var upload = multer.single('image');
        upload(req, res, (err) => {
            var newThumb = !(typeof req.file=="undefined");
            var body = req.body;
            
            admin.uploadImage('image', req, res, (data) => {
                if(data.error && newThumb===true) {
                    res.status(500).send({
                        message: 'Failed to upload image from post'
                    });
                    return;
                }

                var args = {
                    id: body.id,
                    title: body.title,
                    body: body.body,
                    tags: body.tags,
                    author: body.author,
                    category: body.cat
                };

                if(newThumb===true) Object.assign(args, {image: req.file.filename});

                admin.editPost(args, (data) => {
                    if(data.error) {
                        res.status(500).send({
                            message: 'Failed to update post'
                        });
                        return;
                    }
        
                    if(body.redirect) {
                        res.redirect(body.redirect);
                        return;
                    }else {
                        res.status(200).send({
                            message: 'Post was updated successfully'
                        });
                    }
                });
            });
        });

    }

};