var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/tags/edit',

    handle: (req, res) => {
        admin.editTag(req.body, (result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to edit tag",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Tag edited successfully",
                result: JSON.stringify(result.result)
            });

        });
    }

};