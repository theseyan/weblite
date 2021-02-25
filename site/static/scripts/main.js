function _(q) {return document.getElementById(q);}

var xScrollable = {
    prev: function(el) {
        el.parentNode.scrollLeft -= 200;
    },
    next: function(el) {
        el.parentNode.scrollLeft += 200;
    }
};

var searchForm = {
    submit: function () {
        var q = _('searchInput').value;
        window.location.href = "/search/" + encodeURIComponent(q);
        return false;
    }
};

var Menu = {
    open: function() {
        _('menu-sidebar').style.transform = "translateX(0)";
        _('fade').style.display = "block";
        _('fade').onclick = Menu.close;
    },
    close: function() {
        _('menu-sidebar').style.transform = "translateX(calc(-100% - 10px))";
        _('fade').style.display = "none";
        _('fade').onclick = function() {};
    },
    openSearch: function() {
        Menu.open();
        _('sidebarSearchInp').focus();
    },
    moveLeft: function(el) {
        _('menu').scrollLeft -= 100;
    },
    moveRight: function(el) {
        _('menu').scrollLeft += 100;
        _('menu.moveLeft').style.display = "inline-block";
    }
};