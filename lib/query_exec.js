(function(){
    var Iterator = require('./iterator.js');
    var Dictionary = require('./dictionary.js');

    var QueryExec = function(){
        this.iterator = new Iterator();
    };

    QueryExec.prototype.from = function(args){
        var dataSource = args.dataSource;
        var collection = args.collection;

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

                if(item === undefined){
                    return callback();
                } else {
                    return callback(null, selector(item));
                }
            });
        };
    };

    QueryExec.prototype.where = function(args){
        var expression = args.expression;

        var prevIterator = this.iterator;
        this.iterator = new Iterator();
        this.iterator.next = function(callback){
            prevIterator.next(function nextHandler(err, item){
                if(err){
                    return callback(err);
                }

                if(item === undefined){
                    return callback();
                } else if(expression(item)) {
                    return callback(null, item);
                } else {
                    return prevIterator.next(nextHandler);
                }
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

    QueryExec.prototype.union = function(second, compareSelector){
        var self = this;
        var first = this.iterator;
        var firstExhausted = false;

        var dictionary = new Dictionary(compareSelector);

        var trySecondIterator = function(callback){
            second.next(function(err, item) {
                if (err) {
                    return callback(err);
                }

                if (item === undefined) {
                    //Exhaused 1st and 2nd iterators
                    return callback();
                } else if (!dictionary.contains(item)) {
                    dictionary.add(item);
                    return callback(null, item);
                } else {
                    //Already returned this item
                    trySecondIterator(callback);
                }
            });
        };

        this.iterator = new Iterator();
        this.iterator.next = function (callback) {
            if(firstExhausted){
                return trySecondIterator(callback);
            }

            first.next(function firstHandler(err, item) {
                if (err) {
                    return callback(err);
                }

                if (item !== undefined) {
                    if (!dictionary.contains(item)) {
                        dictionary.add(item);
                        return callback(null, item);
                    } else {
                        //Already returned this item
                        first.next(firstHandler);
                    }
                } else {
                    firstExhausted = true;
                    //Exhausted first iterator, do second
                    trySecondIterator();
                }
            });
        };
    };

    QueryExec.prototype.toIterator = function(){
        return this.iterator;
    };

    if(typeof exports !== 'undefined'){
        module.exports = QueryExec;
    }
})();
