var admin = require('../admin');

module.exports = {

    type: 'get',

    route: '/admin/checkUpdates',

    handle: (req, res) => {
        admin.checkUpdates((data) => {

            if(data.error) {
                res.status(200).send({
                    message: "An error occurred while trying to check for new updates",
                    error: data.error
                });
                return;
            }

            res.status(200).send(data);

        });
    }

};