(function(){
    var DataSource = function(){};

    DataSource.prototype.canStream = false;
    DataSource.prototype.canSkip = false;

    DataSource.prototype.getIterator = function(/*{ collection, filter, fields, take, skip }*/){
        throw new Error('getIterator not implemented');
    };

    DataSource.prototype.readProperty = function(item, property){
        return item[property];
    };

    if(typeof exports !== 'undefined'){
        module.exports = DataSource;
    }
})();
