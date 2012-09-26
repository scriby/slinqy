(function(){
    var async = require('async');
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

                    if(amount === 0){
                        //Once we've taken all the items needed, prevent the underlying data source from being called again
                        //The new iterator will just return undefined, indicating it's been exhausted
                        prevIterator = new Iterator();
                    }

                    callback(null, item);
                } else {
                    callback();
                }
            };

            prevIterator.next(handler);
        };
    };

    QueryExec.prototype.union = function(args){
        var first = this.iterator;
        var second = args.second;
        var compareSelector = args.selector;
        var firstExhausted = false;

        var dictionary = new Dictionary(compareSelector);

        var trySecondIterator = function(callback){
            second.next(function(err, item) {
                if (err) {
                    return callback(err);
                }

                if (item === undefined) {
                    //Exhausted 1st and 2nd iterators
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
                    trySecondIterator(callback);
                }
            });
        };
    };

    QueryExec.prototype.unionAll = function(args){
        var first = this.iterator;
        var second = args.second;
        var firstExhausted = false;

        var trySecondIterator = function(callback){
            second.next(function(err, item) {
                if (err) {
                    return callback(err);
                }

                if (item === undefined) {
                    //Exhausted 1st and 2nd iterators
                    return callback();
                } else {
                    return callback(null, item);
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
                    return callback(null, item);
                } else {
                    firstExhausted = true;
                    //Exhausted first iterator, do second
                    trySecondIterator(callback);
                }
            });
        };
    };

    QueryExec.prototype.join = function(args){
        var second = args.second;
        var outerSelector = args.outerSelector;
        var innerSelector = args.innerSelector;
        var resultSelector = args.resultSelector;

        var self = this;
        var first = this.iterator;

        var loopDict, lookupDict, getResult, keys, i = 0, currLoopItem, matchedItems, matchIndex;

        var setup = function(callback){
            async.parallel([
                function(callback){
                    first.toDictionary(innerSelector, callback);
                },

                function(callback){
                    second.toDictionary(outerSelector, callback);
                }
            ], function(err, dictionaries){
                if(err){
                    return callback(err);
                }

                var firstDict = dictionaries[0];
                var secondDict = dictionaries[1];

                if(firstDict.count() < secondDict.count()){
                    loopDict = firstDict;
                    lookupDict = secondDict;
                    getResult = function(loopItem, lookupItem){
                        return resultSelector(loopItem, lookupItem);
                    };
                } else {
                    loopDict = secondDict;
                    lookupDict = firstDict;
                    getResult = function(loopItem, lookupItem){
                        return resultSelector(lookupItem, loopItem);
                    }
                }

                keys = loopDict.keys();

                callback();
            });
        };

        var getNext = function(callback){
            if(matchedItems != null && matchIndex < matchedItems.length){
                return callback(null, getResult(matchedItems[matchIndex++]));
            } else {
                if(i < keys.length){
                    matchedItems = lookupDict.getAll(keys[i]);
                    matchIndex = 0;
                    i++;

                    return getNext(callback);
                } else {
                    return callback();
                }
            }
        };

        this.iterator = new Iterator();
        this.iterator.next = function(callback) {
            if(keys == null){
                setup(function(err){
                    if(err){
                        return callback(err);
                    }

                    getNext(callback);
                });
            } else {
                getNext(callback);
            }
        };
    };

    QueryExec.prototype.toIterator = function(){
        return this.iterator;
    };

    if(typeof exports !== 'undefined'){
        module.exports = QueryExec;
    }
})();
