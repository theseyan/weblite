var admin = require('../admin');

module.exports = {

    type: 'get',

    route: '/gallery/getImages',

    handle: (req, res) => {
        admin.getMediaFiles('./site/static/images/uploads' + req.query.path, (result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to get images",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Media gallery images fetched successfully",
                images: JSON.stringify(result.files)
            });

        });
    }

};