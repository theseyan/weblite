import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './EditPostPage.ejs';
import Placeholder from './Placeholder.ejs';
import {Tags} from '../../components/Tags/Tags';
import {InputDropdown} from '../../components/InputDropdown/InputDropdown';

var searchTags = (q, cb) => {
    Util.ajaxReq({
        type: 'post',
        url: window.config.apiUrl + '/tags/get',
        content: {
            query: `tag LIKE "${q}%" OR label LIKE "${q}%" LIMIT 5`
        },
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data);
            var tags = JSON.parse(data.tags);
            
            cb({
                tags: tags
            });
        },
        onerror: function(err) {
            Notify('failure', 'Failed to search for tags: ' + err);
        }
    });
};

Router.on('/editPost/:id', ({data}) => {
    Page.setContent(Placeholder());

    Util.ajaxReq({
        type: 'get',
        url: window.config.apiUrl + '/admin/getPosts',
        content: `id=${data.id}`,
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

                var tagsBox = new Tags(Util._('tags-box'));
                var inputDropdown = new InputDropdown(Util._('tagsDropdown'));

                var updateTagIds = () => {
                    var ids = [];
                    tagsBox.tags.forEach(tag => {
                        if(ids.indexOf(tag.id) != -1) return;
                        ids.push(tag.id);
                    });

                    Util._('tags.ids').value = ids.join(',');
                };

                tagsBox.events.on('remove', updateTagIds);

                (function() {
                    if(!post.tags || post.tags == null) return;
                    var tags = (post.tags + ",").split(",");
                    tags.pop();
                    tags.forEach(tag => {
                        tagsBox.add({
                            tag: tag.split(':')[1],
                            id: Number(tag.split(':')[0])
                        });
                    });
                    updateTagIds();
                })();

                Util._('tags').addEventListener('input', (evt) => {
                    inputDropdown.showDropdown();
                    var value = Util._('tags').value;
                    searchTags(value, (data) => {

                        inputDropdown.clearItems();
                        data.tags.forEach((item) => {
                            inputDropdown.addItem({
                                content: item.label,
                                onaction: () => {
                                    tagsBox.add(item);
                                    inputDropdown.hideDropdown();
                                    Util._('tags').value = "";
                                    updateTagIds();
                                }
                            });
                        });

                    });
                });
        
                window.tinyMCE.init({
                    selector:'textarea#postBodyEditor',
                    height: 500,
                    plugins: [
                        'advlist autolink link image lists charmap print preview hr anchor pagebreak',
                        'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
                        'table emoticons template paste help'
                    ],
                    toolbar: 'fullscreen | undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | link image | print preview media fullpage | ' +
                    'forecolor backcolor emoticons | help',
                    mobile: {
                        menubar: true,
                    },
                    contextmenu: 'paste link'
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

                if(Util._('draft-publish-btn')) Util._('draft-publish-btn').onclick = (evt) => {
                    window.tinymce.triggerSave(true, true);
                    var html = evt.currentTarget.innerHTML;
                    var btn = evt.currentTarget;
                    btn.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Publishing as Post...";
                    btn.classList.add('disabled');
                
                    Util.submitForm(Util._('cp-form'), window.config.apiUrl + '/admin/createPost', (data) => {
                        btn.innerHTML = html;
                        btn.classList.remove('disabled');
        
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
        },
        onerror: function(err) {
            Notify('failure', 'Failed to fetch post: ' + err);
            console.log(err);
        }
    });
});