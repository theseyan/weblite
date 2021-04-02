import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './EditPostPage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/editPost/:id', ({data}) => {
    Page.setContent(Placeholder());

    Util.ajaxReq({
        type: 'post',
        url: window.config.apiUrl + '/admin/getPosts?id=' + data.id,
        content: '',
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data);
            var post = JSON.parse(data.posts)[0];

            Util.loadScript('/assets/tinymce/js/tinymce/tinymce.min.js', () => {
        
                Page.setContent(Template({
                    post: post,
                    adminUrl: window.config.adminUrl,
                    siteRoot: window.config.websiteUrl
                }));
        
                window.tinyMCE.init({
                    selector:'textarea#postBodyEditor',
                    height: 500,
                    plugins: [
                        'advlist autolink link image lists charmap print preview hr anchor pagebreak',
                        'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
                        'table emoticons template paste help'
                    ],
                    toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | link image | print preview media fullpage | ' +
                    'forecolor backcolor emoticons | help'
                });
        
                Util._('post-btn').onclick = (evt) => {
                    window.tinymce.triggerSave(true, true);
                    var html = evt.currentTarget.innerHTML;
                    var btn = evt.currentTarget;
                    btn.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Updating Post...";
                    btn.classList.add('disabled');
        
                    Util.submitForm(Util._('cp-form'), window.config.apiUrl + '/admin/editPost', (data) => {
                        btn.innerHTML = html;
                        btn.classList.remove('disabled');
        
                        Notify('success', 'Post updated successfully');
                    }, (err) => {
                        btn.innerHTML = html;
                        btn.classList.remove('disabled');
        
                        Notify('failure', 'An error occured: ' + err);
                    });
                };

                Util._('permalink-inp').oninput = () => {
                    var val = Util._('permalink-inp').value;
                    val = encodeURIComponent(val.replace(/\s+/g, '-').toLowerCase());
        
                    Util._('permalink-value').value = val;
                    Util._('permalink-preview').innerHTML = val;
                };
        
            }, (err) => {
                Notify('failure', 'An error occured: ' + err);
            });
        },
        onerror: function(err) {
            Notify('failure', 'Failed to fetch post: ' + err);
        }
    });
});