import {Event} from '../../Core';

export var InputDropdown = function(node) {

    this.events = Event();
    this.node = node;
    this.items = [];
    this.input = node.querySelector('input');
    this.dropdown = node.querySelector('.dropdown');
    this.activeItem = null;

    this.showDropdown = () => {
        this.dropdown.style.display = 'block';
    };

    this.hideDropdown = () => {
        this.dropdown.style.display = 'none';
    };

    this.addItem = (data) => {
        var item = document.createElement('span');
        item.className = 'item';
        item.innerHTML = data.content;

        item.onclick = data.onaction;

        this.items.push(data);
        this.dropdown.appendChild(item);
        this.events.fire('addItem', data);
    };

    this.removeItem = (index) => {
        this.dropdown.removeChild(this.dropdown.childNodes[index]);
        this.items.splice(index, 1);

        this.events.fire('removeItem', {index: index});
    };

    this.clearItems = () => {
        this.dropdown.innerHTML = "";
        this.items = [];
        this.activeItem = null;
    };

    this.select = (index) => {
        if(this.activeItem != null) {
            this.dropdown.childNodes[this.activeItem].className = 'item';
        }
        this.dropdown.childNodes[index].className = 'item active';
        this.activeItem = index;
    };

    this.unselect = () => {
        if(this.activeItem != null) this.dropdown.childNodes[this.activeItem].className = 'item';
        this.activeItem = null;
    };

    this.input.addEventListener('focus', this.showDropdown);
    addEventListener('mousedown', (evt) => {
        if(this.dropdown.contains(evt.target) || evt.target == this.input) return;
        else this.hideDropdown();
    });

    addEventListener('keydown', (evt) => {
        if(document.activeElement == this.input) {
            if(evt.key == "ArrowUp") {
                if(this.activeItem != null && this.activeItem > 0) {
                    evt.preventDefault();
                    this.select(this.activeItem - 1);
                }
            }
            else if(evt.key == "ArrowDown") {
                if(this.activeItem == null && this.items.length != 0) {
                    evt.preventDefault();
                    this.select(0);
                }else if(this.activeItem < this.items.length-1) {
                    evt.preventDefault();
                    this.select(this.activeItem + 1);
                }
            }
            else if(evt.key == "Enter") {
                if(this.activeItem != null) {
                    evt.preventDefault();
                    this.items[this.activeItem].onaction();
                }
            }
        }
    });

};