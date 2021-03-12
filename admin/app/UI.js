export var Notify = (type, text) => {
    alert(text);
};

export var Confirm = (title, text, next) => {
    var c = confirm(text);
    next(c);
};