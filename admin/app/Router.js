/**
 * Navigo router
 * @router
*/

import Navigo from 'navigo';

const root = '/';
export var Router = new Navigo(root, {hash: true});

// Add reload method to Router
Router.reload = () => {
    Router.navigate("/", {
        updateBrowserURL: false,
        callHandler: false
    });
    Router.navigate(Router.getCurrentLocation().hashString);
};

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