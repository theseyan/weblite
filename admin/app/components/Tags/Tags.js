import {Event} from '../../Core';

export var Tags = function(node) {

    this.events = Event();
    this.node = node;
    this.tags = [];

    this.add = (data) => {
        var tag = document.createElement('span');
        tag.className = "tag";
        tag.innerHTML = `${data.tag} <span class="fa fa-times-circle"></span>`;

        tag.lastElementChild.onclick = () => {
            this.remove({
                tag: data.tag
            });
        };

        this.tags.push(data);
        this.node.appendChild(tag);

        this.events.fire('add', data);
        this.events.fire('input', data);
    };

    this.remove = (data) => {
        var index = this.tags.findIndex(i => i.tag == data.tag);
        if(index == -1) return;
        var tag = this.tags[index];
        this.node.removeChild(this.node.childNodes[index]);
        this.tags.splice(index, 1);

        this.events.fire('remove', tag);
        this.events.fire('input', tag);
    };

    this.clear = () => {
        this.node.innerHTML = "";
        this.tags = [];
        this.events.fire('clear', {});
        this.events.fire('input', {});
    };

};