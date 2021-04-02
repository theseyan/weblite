import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './CreatePostPage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/createPost', () => {
    Page.setContent(Placeholder());

    Util.loadScript('/assets/tinymce/js/tinymce/tinymce.min.js', () => {
        
        Page.setContent(Template({
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
            btn.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Posting...";
            btn.classList.add('disabled');

            Util.submitForm(Util._('cp-form'), window.config.apiUrl + '/admin/createPost', (data) => {
                btn.innerHTML = html;
                btn.classList.remove('disabled');
                Util._('cp-form').reset();

                Notify('success', 'Post published successfully');
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
});