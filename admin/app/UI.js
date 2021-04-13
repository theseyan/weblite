import {Util} from './Core';

var Notifications = [];
var NotifTimeout = null;

var CloseNotification = () => {
    var notifBox = Util._('notification');
    var icon = Util._('notification.icon');
    var text = Util._('notification.text');
    var closeBtn = Util._('notification.closeBtn');

    notifBox.style.transform = "translateY(110%)";

    setTimeout(() => {
        icon.classList.remove('fa-times');
        icon.classList.remove('fa-check');
        text.innerHTML = "";
        clearTimeout(NotifTimeout);
        NotifTimeout = null;

        RenderNotifications();
    }, 200);
};
var RenderNotifications = () => {
    if(NotifTimeout != null) return;
    if(Notifications.length < 1) {
        clearTimeout(NotifTimeout);
        NotifTimeout = null;
        return;
    };

    var notifBox = Util._('notification');
    var icon = Util._('notification.icon');
    var text = Util._('notification.text');
    var closeBtn = Util._('notification.closeBtn');
    var notification = Notifications[0];

    if(notification.type == 'error' || notification.type == 'failure') {
        icon.classList.remove('fa-check');
        icon.classList.add('fa-times');
    }else if(notification.type == 'success') {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-check');
    }
    text.innerHTML = notification.text;
    notifBox.style.transform = "translateY(-20px)";

    closeBtn.onclick = CloseNotification;

    Notifications.shift();
    NotifTimeout = setTimeout(CloseNotification, 5000);
};
export var Notify = (type, text) => {
    Notifications.push({
        type: type,
        text: text
    });
    RenderNotifications();
};
window.Notify = Notify;
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