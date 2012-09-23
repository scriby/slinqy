(function(){
    if(typeof exports !== 'undefined'){
        exports.DataSource = require('./datasource.js');
        exports.Iterator = require('./iterator.js');
        exports.Query = require('./query.js');
        exports.QueryExec = require('./query_exec.js');
    }

    exports.from = function(DataSourceType, collection){
        var query = new exports.Query();
        return query.from(DataSourceType, collection);
    };
})();