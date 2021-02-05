var admin = require('../admin');

module.exports = {

    type: 'get',

    route: '/system/status',

    handle: (req, res) => {
        admin.getSystemStatus((result) => {

            if(result.error) {
                res.status(500).send({
                    error: result.error
                });
                return;
            }

            res.status(200).send(result);

        });
    }

};