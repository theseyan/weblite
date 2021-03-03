var chokidar = require('chokidar');
var fs = require('fs');

// JSON Data files
var sources = {
    "Collections": "./site/src/data/Collections.json",
    "Menus": "./site/src/data/Menus.json"
};

// Holds live data
global.Data = [];

// Reloads a data variable from the file system
function reload(item) {
    fs.readFile(sources[item], {encoding: 'utf-8'}, function(err, data){
        if (!err) {
            var obj = JSON.parse(data);
            global.Data[item] = obj;
        } else {
            console.error('Error reloading data: ' + err);
        }
    });
}

// Initialize data
for(var item in sources) {
    global.Data[item] = require("../../" + sources[item]);
};

// Updates a data variable based on file path
function update(path) {
    path = "./" + path.replace(/\\/g, "/");
    
    for(var item in sources) {
        if(sources[item] == path) {
            reload(item);
            return;
        }
    }
}

// Register the file watcher
var files = [];
for(var item in sources) files.push(sources[item]);
const watcher = chokidar.watch(files, {
    persistent: true
});

watcher.on('change', update);