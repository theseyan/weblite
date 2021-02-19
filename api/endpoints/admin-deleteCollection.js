var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/data/deleteCollection',

    handle: (req, res) => {
        admin.deleteCollection('site/src/data/Collections.json', req.body.path, (result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to delete the collection",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Collection deleted successfully"
            });

        });
    }

};