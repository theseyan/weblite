var admin = require('../admin');

module.exports = {

    type: 'get',

    route: '/data/getCollections',

    handle: (req, res) => {
        admin.getCollections((result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to get collections",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Collections fetched successfully",
                collections: JSON.stringify(result)
            });

        });
    }

};