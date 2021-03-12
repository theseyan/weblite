/**
 * Navigo router
 * @router
*/

import Navigo from 'navigo';

const root = '/';
export var Router = new Navigo(root, {hash: true});

Router.hooks({
    before(done, match) {
        if(localStorage.getItem('wa-authToken')==null || localStorage.getItem('wa-username')==null) {
            window.location.href=config.adminUrl + "/login";
            return;
        }
        done();
    }
});

window.Router = Router;