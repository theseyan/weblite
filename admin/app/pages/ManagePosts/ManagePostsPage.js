import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './ManagePostsPage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/managePosts/:type', ({data}) => {
    Page.setContent(Placeholder());

    var params = data;
    var validTypes = ['draft', 'public', 'private'];
    if(validTypes.indexOf(params.type) == -1) {
        Notify('error', 'Failed to fetch posts because of invalid post type');
        return;
    }

    Util.ajaxReq({
        type: 'get',
        url: window.config.apiUrl + '/admin/getPosts',
        content: `type=${params.type}`,
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data);
            var posts = JSON.parse(data.posts);

            Page.setContent(Template({
                posts: posts,
                adminUrl: window.config.adminUrl,
                type: params.type
            }));
        },
        onerror: function(err) {
            Notify('failure', 'Failed to fetch posts: ' + err);
        }
    });
});