var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/data/setCollections',

    handle: (req, res) => {
        admin.setCollections('site/src/data/Collections.json', req.body.collections, (result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to set collections",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Collections edited successfully"
            });

        });
    }

};