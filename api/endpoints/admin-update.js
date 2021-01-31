var admin = require('../admin');

module.exports = {

    type: 'get',

    route: '/admin/update',

    handle: (req, res) => {
        admin.update((result) => {

            if(result.error) {
                res.status(500).send({
                    error: result.error
                });
                return;
            }

            res.status(200).send({
                status: "Success",
                result: result
            });

        });
    }

};