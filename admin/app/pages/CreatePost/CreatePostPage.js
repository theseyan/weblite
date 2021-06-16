import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify, Confirm} from '../../UI';
import Template from './CreatePostPage.ejs';
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

Router.on('/createPost', () => {
    var isAutoSaved = !(typeof localStorage['weblite-createPost-autoSave']=="undefined");
    Page.setContent(Placeholder());

    Util.loadScript('/assets/tinymce/js/tinymce/tinymce.min.js', () => {
        
        Page.setContent(Template({
            siteRoot: window.config.websiteUrl,
            autoSaved: isAutoSaved===false ? false : {
                data: JSON.parse(localStorage.getItem('weblite-createPost-autoSave')),
                lastSave: localStorage.getItem('weblite-createPost-lastSave')
            }
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


        var submitForm = (evt) => {
            window.tinymce.triggerSave(true, true);
            var html = evt.currentTarget.innerHTML;
            var btn = evt.currentTarget;
            btn.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Posting...";
            btn.classList.add('disabled');

            Util.submitForm(Util._('cp-form'), window.config.apiUrl + '/admin/createPost', (data) => {
                btn.innerHTML = html;
                btn.classList.remove('disabled');
                Util._('cp-form').reset();
                Util._('permalink-preview').innerHTML = "";
                tagsBox.clear();

                // Clear autosave
                localStorage.removeItem('weblite-createPost-autoSave');
                localStorage.removeItem('weblite-createPost-lastSave');

                Notify('success', 'Post published successfully');
            }, (err) => {
                btn.innerHTML = html;
                btn.classList.remove('disabled');

                Notify('failure', 'An error occured: ' + err);
            });
        };
        Util._('post-btn').onclick = submitForm;

        Util._('permalink-inp').oninput = () => {
            var val = Util._('permalink-inp').value;
            val = encodeURIComponent(val.replace(/\s+/g, '-').toLowerCase());

            Util._('permalink-value').value = val;
            Util._('permalink-preview').innerHTML = val;
        };

        // Local Autosave
        var form = Util._('cp-form');
        var registerAutoSave = () => {
            setInterval(() => {
                if(window.tinymce.activeEditor.getContent() == "" && Util._('title').value == "") return;

                window.tinymce.triggerSave(true, true);
                var data = new FormData(form);
                var fields = {};
                for(var pair of data.entries()) {
                    fields[pair[0]] = pair[1];
                }

                localStorage.setItem('weblite-createPost-autoSave', JSON.stringify(fields));
                localStorage.setItem('weblite-createPost-lastSave', Date());
            }, 10000);
        };
        form.addEventListener('input', () => {
            if(isAutoSaved===true) {
                Confirm('Continue editing?', 'Editing a new post will overwrite the previous autosaved post. Continue?', (res) => {
                    if(res === true) registerAutoSave();
                });
            }else registerAutoSave();
        }, {once: true});

        // Resume Autosaved Post button
        if(isAutoSaved===true) {
            Util._('resumeEditingBtn').addEventListener('click', () => {
                Util._('autosavedMessageBox').remove();
                var post = JSON.parse(localStorage.getItem('weblite-createPost-autoSave'));
                Util._('title').value = post.title;
                Util._('cat').value = post.cat;
                Util._('tags').value = post.tags;
                Util._('date').valueAsNumber = post.lastDate * 1000;
                Util._('lastDate').value = post.lastDate;
                Util._('imageAlt').value = post.imageAlt;
                Util._('permalink-inp').value = post.permalink;
                Util._('permalink-preview').innerHTML = post.permalink;
                Util._('postBodyEditor').value = post.body;
                window.tinymce.activeEditor.render();
                isAutoSaved = false;
            });
            Util._('closeAutosavedBtn').addEventListener('click', function() {
                this.parentNode.remove();
                isAutoSaved = false;
            });
        }

        // Save as Draft button
        Util._('draft-btn').addEventListener('click', (evt) => {
            Util._('postType').value = 'draft';
            submitForm(evt);
        });

    }, (err) => {
        Notify('failure', 'An error occured: ' + err);
    });
});