import {Router} from '../../Router';
import {Session, Page, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './CollectionsPage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/collections', () => {

    Page.setContent(Placeholder());

    Util.ajaxReq({
        type: 'get',
        url: window.config.apiUrl + '/data/getCollections',
        content: '',
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data);
            var collections = JSON.parse(data.collections);

            Util.loadCSS('/assets/jsoneditor/dist/jsoneditor.min.css');
            Util.loadScript('/assets/jsoneditor/dist/jsoneditor-minimalist.min.js', () => {
                Page.setContent(Template({
                    label: "Collections"
                }));

                // Create the editor
                var container = Util._("editor");
                window.editor = new JSONEditor(container);

                window.editor.set(collections.collections);

                // Save button behaviour
                Util._('saveBtn').onclick = (evt) => {

                    var el = evt.currentTarget;
                    var data = JSON.stringify(window.editor.get());
                    var html = el.innerHTML;
                    el.innerHTML = "<span class='fa fa-spin fa-sync'></span> Saving changes...";
                    el.classList.add("disabled");

                    Util.ajaxReq({
                        type: 'post',
                        url: window.config.apiUrl + '/data/setCollections',
                        content: {
                            collections: data
                        },
                        headers: [{
                            header: 'Authorization',
                            content: 'Basic ' + Session.token
                        }],
                        onload: (data) => {
                            Notify('success', 'Saved changes successfully');
                            el.innerHTML = html;
                            el.classList.remove('disabled');
                        },
                        onerror: (data) => {
                            Notify('failure', 'Failed to edit collections: ' + data);
                        }
                    });

                };
            });
        },
        onerror: function(err) {
            Notify('failure', 'Failed to fetch collections: ' + err);
        }
    });

});