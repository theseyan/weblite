var admin = require('../admin');

module.exports = {

    type: 'post',

    route: '/admin/login',

    handle: (req, res) => {
        admin.login({
            username: req.body.username,
            password: req.body.password
        }, (data) => {
            if(data.error) {
                res.status(500).send({
                    message: "An error occurred while trying to authenticate your credentials",
                    error: data.error
                });
                return;
            }

            if(req.body.redirect) {
                res.redirect(req.body.redirect + '/token/' + encodeURIComponent(data.token));
            }else {
                res.status(200).send({
                    token: data.token,
                    user: data.user
                });
            }
        });
    }

};