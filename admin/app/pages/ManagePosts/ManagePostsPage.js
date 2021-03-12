import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './ManagePostsPage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/managePosts', () => {
    Page.setContent(Placeholder());

    Util.ajaxReq({
        type: 'post',
        url: window.config.apiUrl + '/admin/getPosts',
        content: '',
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data);
            var posts = JSON.parse(data.posts);

            Page.setContent(Template({
                posts: posts,
                adminUrl: window.config.adminUrl
            }));
        },
        onerror: function(err) {
            Notify('failure', 'Failed to fetch posts: ' + err);
        }
    });
});