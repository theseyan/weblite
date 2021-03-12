import {Router} from '../../Router';
import {Session, Util} from '../../Core';
import {Notify, Confirm} from '../../UI';
import Template from './DeletePostDialog.ejs';

Router.on('/deletePost/:id', ({data}) => {

    Confirm('Confirm delete', 'Are you sure you want to delete Post with ID ' + data.id, (state) => {
        
        if(state === true) {
            Util.ajaxReq({
                type: 'post',
                url: window.config.apiUrl + '/admin/deletePost',
                content: {
                    id: data.id
                },
                headers: [{
                    header: 'Authorization',
                    content: 'Basic ' + Session.token
                }],
                onload: function(data) {
                    data = JSON.parse(data);
                    
                    Notify('success', 'Post was deleted successfully');

                    if(window.history.length > 2) window.history.back();
                    else Router.navigate('/');
                },
                onerror: function(err) {
                    Notify('failure', 'Failed to fetch posts: ' + err);

                    if(window.history.length > 2) window.history.back();
                    else Router.navigate('/');
                }
            });
        }else {
            if(window.history.length > 2) window.history.back();
            else Router.navigate('/');
        }

    });

});