import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import Template from './HomePage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/', () => {
    Page.setContent(Placeholder());

    Util.ajaxReq({
        url: config.apiUrl + '/system/status',
        type: 'get',
        content: '',
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: (resp) => {
            Page.setContent(Template({
                siteHealth: resp
            }));
        },
        onerror: (resp) => {}
    });

});