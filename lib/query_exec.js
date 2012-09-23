(function(){
    var Iterator = require('./iterator.js');

    var QueryExec = function(){
        this.iterator = new Iterator();
    };

    QueryExec.prototype.from = function(args){
        var DataSourceType = args.dataSourceType;
        var collection = args.collection;

        var dataSource = new DataSourceType();

        this.iterator = dataSource.getIterator({ collection: collection });
    };

    QueryExec.prototype.select = function(args){
        var selector = args.selector;

        var prevIterator = this.iterator;

        this.iterator = new Iterator();
        this.iterator.next = function(callback){
            prevIterator.next(function(err, item){
                if(err){
                    return callback(err);
                }

                callback(null, selector(item));
            });
        };
    };

    QueryExec.prototype.skip = function(args){
        var amount = args.amount;

        var prevIterator = this.iterator;

        this.iterator = new Iterator();
        this.iterator.next = function(callback){
            var handler = function(err, item){
                if(err){
                    return callback(err);
                }

                if(amount > 0){
                    amount--;
                    prevIterator.next(handler);
                } else {
                    callback(null, item);
                }
            };

            prevIterator.next(handler);
        };
    };

    QueryExec.prototype.take = function(args){
        var amount = args.amount;

        var prevIterator = this.iterator;

        this.iterator = new Iterator();
        this.iterator.next = function(callback){
            var handler = function(err, item){
                if(err){
                    return callback(err);
                }

                if(amount > 0){
                    amount--;
                    callback(null, item);
                } else {
                    callback();
                }
            };

            prevIterator.next(handler);
        };
    };

    QueryExec.prototype.toIterator = function(){
        return this.iterator;
    };

    if(typeof exports !== 'undefined'){
        module.exports = QueryExec;
    }
})();
