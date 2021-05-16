var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/tags/delete',

    handle: (req, res) => {
        admin.deleteTag(req.body.id, (result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to delete tag",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Tag deleted successfully"
            });

        });
    }

};