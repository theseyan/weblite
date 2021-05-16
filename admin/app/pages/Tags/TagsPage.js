import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify, Confirm} from '../../UI';
import Template from './TagsPage.ejs';
import CreateTagTemplate from './CreateTagPage.ejs';
import EditTagTemplate from './EditTagTemplate.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/tags', () => {
    Page.setContent(Placeholder());

    Util.ajaxReq({
        type: 'post',
        url: window.config.apiUrl + '/tags/get',
        content: '',
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data);
            var tags = JSON.parse(data.tags);

            Page.setContent(Template({
                tags: tags,
                adminUrl: window.config.adminUrl
            }));
        },
        onerror: function(err) {
            Notify('failure', 'Failed to fetch tags: ' + err);
        }
    });
});

Router.on('/tags/create', () => {
    Page.setContent(CreateTagTemplate());

    var submitForm = (evt) => {
        var html = evt.currentTarget.innerHTML;
        var btn = evt.currentTarget;
        btn.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Creating Tag...";
        btn.classList.add('disabled');

        Util.submitForm(Util._('ct-form'), window.config.apiUrl + '/tags/create', (data) => {
            btn.innerHTML = html;
            btn.classList.remove('disabled');
            Util._('ct-form').reset();

            Notify('success', 'Tag created successfully');
        }, (err) => {
            btn.innerHTML = html;
            btn.classList.remove('disabled');

            Notify('failure', 'An error occured: ' + err);
        });
    };

    Util._('createTag-btn').onclick = submitForm;
});

Router.on('/tags/edit/:id', ({data}) => {
    Page.setContent(Placeholder());
    Util.ajaxReq({
        type: 'post',
        url: window.config.apiUrl + '/tags/get',
        content: {
            query: `id = ${data.id}`
        },
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data);
            var tag = JSON.parse(data.tags)[0];

            Page.setContent(EditTagTemplate({
                tag: tag
            }));

            var submitForm = (evt) => {
                var html = evt.currentTarget.innerHTML;
                var btn = evt.currentTarget;
                btn.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Saving changes...";
                btn.classList.add('disabled');
        
                Util.submitForm(Util._('ct-form'), window.config.apiUrl + '/tags/edit', (data) => {
                    btn.innerHTML = html;
                    btn.classList.remove('disabled');
        
                    console.log(data);
                    Notify('success', 'Tag edited successfully');
                }, (err) => {
                    btn.innerHTML = html;
                    btn.classList.remove('disabled');
        
                    Notify('failure', 'An error occured: ' + err);
                });
            };
        
            Util._('editTag-btn').onclick = submitForm;
        },
        onerror: function(err) {
            Notify('failure', 'Failed to fetch tag data: ' + err);
        }
    });
});

Router.on('/tags/delete/:id', ({data}) => {
    Confirm('Confirm delete', 'Are you sure you want to delete Tag with ID ' + data.id, (state) => {
        
        if(state === true) {
            Util.ajaxReq({
                type: 'post',
                url: window.config.apiUrl + '/tags/delete',
                content: {
                    id: data.id
                },
                headers: [{
                    header: 'Authorization',
                    content: 'Basic ' + Session.token
                }],
                onload: function(data) {
                    data = JSON.parse(data);
                    
                    Notify('success', 'Tag was deleted successfully');

                    Router.back();
                },
                onerror: function(err) {
                    Notify('failure', 'Failed to delete tag: ' + err);

                    Router.back();
                }
            });
        }else {
            Router.back();
        }

    });
});