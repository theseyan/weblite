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