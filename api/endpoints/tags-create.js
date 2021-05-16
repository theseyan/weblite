var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/tags/create',

    handle: (req, res) => {
        var data = req.body;
        admin.createTag(data, (result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to create tag",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Tag created successfully",
                result: JSON.stringify(result.result)
            });

        });
    }

};