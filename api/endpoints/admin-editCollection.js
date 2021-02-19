var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/data/editCollection',

    handle: (req, res) => {
        admin.editCollection('site/src/data/Collections.json', req.body.path, JSON.parse(req.body.body), (result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to edit collections",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Collection edited successfully"
            });

        });
    }

};