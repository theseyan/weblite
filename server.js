/**
 * weblite
 * Launch script
 * @author Sayan J. Das
*/

require('./data/module/Data');
var admin = require('./admin/init');
var api = require('./api/init');
var site = require('./site/init');

// Launch CMS
api();
admin();
site();