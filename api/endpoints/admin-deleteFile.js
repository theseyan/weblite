var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/admin/deleteFile',

    handle: (req, res) => {
        admin.deleteFile(req.body.path, (data) => {

            if(data.error) {
                res.status(500).send({
                    message: "An error occurred while trying to delete file",
                    error: data.error
                });
                return;
            }

            res.status(200).send({
                message: "File deleted successfully"
            });

        });
    }

};