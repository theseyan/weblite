import {Util} from './Core';

export var Notify = (type, text) => {
    alert(text);
};

export var Confirm = (title, text, next) => {
    var c = confirm(text);
    next(c);
};

/**
 * Page UI Functionality
*/

var Menu = {
    open: function(el) {
        Util._('sidebar').style.transform = "translateX(0)";
        Util._('fade').style.visibility = "visible";
        Util._('fade').style.backgroundColor = "#00000030";
        Util._('fade').onclick = Menu.close;

        Util._('sidebar').addEventListener('click', (evt) => {
            if(evt.target.className.indexOf("item") != -1) Menu.close();
        });
    },
    close: function(el) {
        Util._('sidebar').style.transform = "translateX(-100%)";
        Util._('fade').style.backgroundColor = "transparent";
        setTimeout(() => {
            Util._('fade').style.visibility = "hidden";
        }, 200);
        Util._('fade').onclick = void(0);
    }
};

Util._('UI.MenuButton').onclick = (evt) => {
    Menu.open(evt.currentTarget);
};