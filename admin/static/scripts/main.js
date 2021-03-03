function _(q) {return document.getElementById(q);}
function ajaxReq(data) {
    // Create new request
    var HttpRequest=window.ActiveXObject?new ActiveXObject('Microsoft.XMLHttp'):new XMLHttpRequest();
    
    // Handle state change
    HttpRequest.onreadystatechange=function() {
        if(HttpRequest.readyState == 4 && HttpRequest.status == 200) {
            data.onload(HttpRequest.responseText);
        }else if(HttpRequest.readyState == 4 && HttpRequest.status >= 400) {
            data.onerror('Error ' + HttpRequest.status + ': ' + HttpRequest.statusText);
        }
    };

    // Handle error
    HttpRequest.onerror = function() {
        data.onerror('A network error occurred while performing the request');
    };

    // Open URL
    HttpRequest.open(data.type.toUpperCase() , data.type.toLowerCase()=='get' ? data.url + "?" + data.content : data.url );

    // Set headers	
    if(typeof data.headers != 'undefined') {
        for(var i=0; i<=data.headers.length-1; i++) {
            HttpRequest.setRequestHeader(data.headers[i].header, data.headers[i].content);
        }
    }

    if(typeof data.content=="object" && !data.content.get) {
        data.content = JSON.stringify(data.content);
        HttpRequest.setRequestHeader('Content-Type', 'application/json');
    }

    // Send data
    HttpRequest.send(data.type.toLowerCase()=='get' ? null : data.content);
}

var Form = {
    submit: function(form, save) {
        if(typeof save!="undefined" && save===true) tinymce.triggerSave(true,true);
        var data = new FormData(form);
        var redir = data.get('asyncRedirect') ? data.get('asyncRedirect') : null;
        var send = {};
        
        if(form.enctype != "multipart/form-data") {
            for(var pair of data.entries()) {
                send[pair[0]] = pair[1];
            }
        }else {
            send = data;
        }

        ajaxReq({
            type: 'post',
            url: form.action,
            content: send,
            headers: [{
                header: 'Authorization',
                content: 'Basic ' + data.get('authToken')
            }],
            onload: function(data) {
                if(redir != null) {
                    window.location.href = redir;
                }
            },
            onerror: function(data) {
                alert("Error: " + data);
            }
        });
    }
};

var Menu = {
    open: function(el) {
        _('sidebar').style.transform = "translateX(0)";
        el.classList.remove('fa-bars');
        el.classList.add('fa-times');
        el.setAttribute("onclick", "Menu.close(this)");
    },
    close: function(el) {
        _('sidebar').style.transform = "translateX(-255px)";
        el.classList.remove('fa-times');
        el.classList.add('fa-bars');
        el.setAttribute("onclick", "Menu.open(this)");
    }
};

var Update = {
    updateSystem: function(el, token) {
        el.innerHTML = "<span class='fa fa-spin fa-sync'></span> Installing Update...";
        el.classList.add("disabled");
        el.setAttribute("onclick", "");

        ajaxReq({
            type: 'get',
            url: config.apiUrl + "/admin/update",
            content: {},
            headers: [{
                header: 'Authorization',
                content: 'Basic ' + token
            }],
            onload: function(data) {
                el.innerHTML = "<span class='fa fa-check'></span> Restarting...";
                setTimeout(window.location.reload.bind(window.location), 5000);
            },
            onerror: function(data) {
                alert("Error: " + data);
            }
        });
    }
};

var CollectionsEditor = {

    save: function(el, token) {
        var data = JSON.stringify(editor.get());
        var onclick = el.getAttribute('onclick');
        var html = el.innerHTML;
        el.innerHTML = "<span class='fa fa-spin fa-sync'></span> Saving changes...";
        el.classList.add("disabled");
        el.setAttribute("onclick", "");

        ajaxReq({
            type: 'post',
            url: config.apiUrl + "/data/setCollections",
            content: {
                collections: data
            },
            headers: [{
                header: 'Authorization',
                content: 'Basic ' + token
            }],
            onload: function(data) {
                alert("Collections edited successfully");
                el.innerHTML = html;
                el.classList.remove('disabled');
                el.setAttribute("onclick", onclick);
            },
            onerror: function(data) {
                alert("Error: " + data);
            }
        });
    }

};