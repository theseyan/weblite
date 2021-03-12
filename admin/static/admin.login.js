function _(q) {return document.getElementById(q);}
function ajaxReq(data) {
    // Create new request
    var HttpRequest=window.ActiveXObject?new ActiveXObject('Microsoft.XMLHttp'):new XMLHttpRequest();
    
    // Handle state change
    HttpRequest.onreadystatechange=function() {
        if(HttpRequest.readyState == 4 && HttpRequest.status == 200) {
            data.onload(HttpRequest.responseText);
        }else if(HttpRequest.readyState == 4 && HttpRequest.status >= 400) {
            data.onerror('Error ' + HttpRequest.status + ' (' + HttpRequest.statusText + '): ' + HttpRequest.responseText);
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
function login(el) {
    var html = el.innerHTML;

    el.classList.add('disabled');
    el.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Logging in...";

    var uname = _("username").value;
    var password = _("password").value;

    ajaxReq({
        url: config.apiUrl + "/admin/login",
        type: 'post',
        headers: [],
        content: {username: uname, password: password},
        onload: function(resp) {
            el.innerHTML = "<span class='fa fa-check'></span> Success";
            resp = JSON.parse(resp);

            localStorage.setItem('wa-authToken', resp.token);
            localStorage.setItem('wa-username', resp.user.uname);

            window.location.href = config.adminUrl + '/#/';
        },
        onerror: function(resp) {
            el.classList.remove('disabled');
            el.innerHTML = html;

            alert(resp);
        }
    });
}