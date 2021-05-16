import {Router} from './Router';

var _ = (id) => {return document.getElementById(id)};

export var Event = () => {
    
    return {
        __eventHandlers: [],
    
        on: function(evt, handler) {
            if(!this.__eventHandlers[evt]) this.__eventHandlers[evt] = [];
            this.__eventHandlers[evt].push(handler);
            var id = this.__eventHandlers[evt].length-1;

            return {
                remove: () => {
                    this.__eventHandlers[evt].splice(id, 1);
                }
            };
        },

        fire: function(evt, data) {
            if(!this.__eventHandlers[evt]) return;
            
            for(var i=0; i<=this.__eventHandlers[evt].length-1; i++) {
                this.__eventHandlers[evt][i](data);
            }
        },

        wrap: function(evt, target, handler) {
            target.addEventListener(evt, handler);

            return {
                remove: () => {
                    target.removeEventListener(evt, handler);
                }
            };
        }
    };

};

export var Util = {
    _: _,
    ajaxReq: (data) => {
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
    },

    loadScript: (url, onl, onerr) => {
        var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.onload = onl;
        scr.src = url;
        scr.onerror = typeof onerr=="undefined" ? ()=>{} : onerr;
        document.head.appendChild(scr);
    },

    loadCSS: (url) => {
        var scr = document.createElement('link');
        scr.type = 'text/css';
        scr.rel = "stylesheet";
        scr.href = url;
        document.head.appendChild(scr);
    },

    submitForm: (form, url, onl, onerr) => {
        var data = new FormData(form);
        var send = {};
        
        if(form.enctype != "multipart/form-data") {
            for(var pair of data.entries()) {
                send[pair[0]] = pair[1];
            }
        }else {
            send = data;
        }

        Util.ajaxReq({
            type: 'post',
            url: url,
            content: send,
            headers: [{
                header: 'Authorization',
                content: 'Basic ' + Session.token
            }],
            onload: function(data) {
                onl(data);
            },
            onerror: function(data) {
                onerr(data);
            }
        });
    }
};

export var Session = {
    token: localStorage.getItem('wa-authToken'),
    username: localStorage.getItem('wa-username'),
    logout: () => {
        localStorage.removeItem('wa-authToken');
        localStorage.removeItem('wa-username');
        window.location.href = config.adminUrl + '/login';
    }
};

export var Page = {

    setContent: (content) => {
        _('app-body').innerHTML = content;
    }

};

export var EventListener = {

    listeners: [],

    on: (evt, target, handler) => {
        EventListener.listeners.push({
            target: target,
            evt: evt,
            handler: handler
        });
        target.addEventListener(evt, EventListener.listeners[EventListener.listeners.length-1].handler);
        var index = EventListener.listeners.length-1;

        return {
            remove: () => {
                EventListener.remove(index);
            }
        };
    },

    remove: (index) => {
        var item = EventListener.listeners[index];

        item.target.removeEventListener(item.evt, item.handler);
        EventListener.listeners.splice(index, 1);
    },

    removeAll: () => {
        for(var i=0; i<EventListener.listeners.length; i++) {
            EventListener.remove(i);
        }
    }

};

// Remove all event listeners before changing route
Router.hooks({
    before(done, match) {
        EventListener.removeAll();
        done();
    }
});