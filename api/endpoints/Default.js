module.exports = {

    type: 'get',

    route: '/',

    handle: (req, res) => {
        res.status(200).send({
            message: 'Nothing much here.'
        });
    }

};