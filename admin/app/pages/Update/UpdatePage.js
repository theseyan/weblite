import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './UpdatePage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/system/update', () => {
    Page.setContent(Placeholder());

    Util.ajaxReq({
        type: 'get',
        url: window.config.apiUrl + '/admin/checkUpdates',
        content: '',
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data);

            Page.setContent(Template({
                update: data,
                localVersion: config.localVersion
            }));

            Util._('update-btn').onclick = (evt) => {
                var btn = evt.currentTarget;
                var html = btn.innerHTML;
                btn.innerHTML = "<span class='fa fa-spin fa-sync'></span> Installing updates...";
                btn.classList.add('disabled');

                Util.ajaxReq({
                    type: 'get',
                    url: config.apiUrl + "/admin/update",
                    content: '',
                    headers: [{
                        header: 'Authorization',
                        content: 'Basic ' + Session.token
                    }],
                    onload: function(data) {
                        btn.innerHTML = "<span class='fa fa-check'></span> Restarting...";
                        setTimeout(window.location.reload.bind(window.location), 5000);
                    },
                    onerror: function(data) {
                        Notify('failure', 'Failed to install updates ' + data);
                        btn.innerHTML = html;
                        btn.classList.remove('disabled');
                    }
                });
            };
        },
        onerror: function(err) {
            Notify('failure', 'Failed to check for updates: ' + err);
        }
    });
});