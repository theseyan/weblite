var multer = require('multer');
var config = require('../config.json');
var path = require('path');

// Storage for Image Uploads
module.exports.storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'static' + config.website.uploads + '/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});