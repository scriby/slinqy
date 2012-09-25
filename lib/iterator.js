(function(){
    var Iterator = function(){};

    Iterator.prototype.next = function(callback){
        callback();
    };

    Iterator.prototype.toArray = function(callback){
        var self = this;
        var results = [];

        var collect = function(err, item){
            if(err){
                return callback(err);
            }

            if(item !== undefined){
                results.push(item);

                self.next(collect);
            } else {
                callback(null, results);
            }
        };

        this.next(collect);
    };

    Iterator.prototype.dispose = function(callback){
        callback();
    };

    if(typeof exports !== 'undefined'){
        module.exports = Iterator;
    }
})();