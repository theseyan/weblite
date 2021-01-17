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
}