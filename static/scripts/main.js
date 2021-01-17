var xScrollable = {
    prev: function(el) {
        el.parentNode.scrollLeft -= 200;
    },
    next: function(el) {
        el.parentNode.scrollLeft += 200;
    }
};