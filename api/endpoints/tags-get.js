var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/tags/get',

    handle: (req, res) => {
        var q = req.body.query ? req.body.query : '1';
        admin.getTags(q, (result) => {

            if(result.error) {
                res.status(500).send({
                    message: "An error occurred while trying to fetch tags",
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                message: "Tags fetched successfully",
                tags: JSON.stringify(result.result)
            });

        });
    }

};