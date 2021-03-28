import {Router} from '../../Router';
import {EventListener, Page, Session, Util} from '../../Core';
import {Notify, Confirm} from '../../UI';
import Template from './GalleryPage.ejs';
import Placeholder from './Placeholder.ejs';

var getImages = (path, cb) => {
    Util.ajaxReq({
        type: 'get',
        url: window.config.apiUrl + '/gallery/getImages',
        content: 'path=' + path,
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: (data) => {
            data = JSON.parse(data);
            cb(JSON.parse(data.images));
        },
        onerror: (data) => {
            Notify('failure', 'Failed to fetch media gallery: ' + data);
        }
    });
};

Router.on('/gallery', ({data, params, queryString}) => {
    Page.setContent(Placeholder());

    var route = '/';
    if(params && params.route) route = decodeURIComponent(params.route);

    var routes = route.split('/');
    routes.pop();
    routes.shift();

    getImages(route, (data) => {
        var folders = [];
        for(var i=0; i<=data.length-1; i++) {
            if(data[i].dir && data[i].dir == true) {
                folders.push(data.splice(i, 1));
                i--;
            }
        }

        Page.setContent(Template({
            files: data,
            folders: folders,
            siteRoot: window.config.websiteUrl,
            route: route,
            routes: routes
        }));
    });

    EventListener.on("click", window, (event) => {

        // Delete button
        if(event.target.className.indexOf("deleteImageBtn") != -1) {
            var fileName = event.target.getAttribute('data-filename');
            Confirm('Confirm action', 'Are you sure about deleting "'+fileName+'"?', (action) => {
                if(action == true) {
                    Util.ajaxReq({
                        type: 'post',
                        url: window.config.apiUrl + '/admin/deleteFile',
                        content: {
                            path: './site/static/images/uploads' + route + fileName
                        },
                        headers: [{
                            header: 'Authorization',
                            content: 'Basic ' + Session.token
                        }],
                        onload: (data) => {
                            Notify('success', 'Deleted file successfully');
                            Router.reload();
                        },
                        onerror: (data) => {
                            Notify('failure', 'Failed to delete the file: ' + data);
                        }
                    });
                }
            });
        }

        // Image Upload button
        if(event.target.id === "imageUploadBtn") {
            var html = event.target.innerHTML;
            event.target.classList.add('disabled');
            event.target.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Uploading image...";

            Util._('imageUploadPath').value = "/images/uploads" + route;
            Util.submitForm(Util._('uploadImageForm'), window.config.apiUrl + '/admin/uploadImage', (data) => {
                event.target.classList.remove('disabled');
                event.target.innerHTML = html;

                Notify('success', 'Uploaded image successfully');

                Router.reload();
            }, (err) => {
                Notify('failure', 'Failed to upload image: ' + err);

                event.target.classList.remove('disabled');
                event.target.innerHTML = html;
            });
        }

    });

});