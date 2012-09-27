(function(){
    var utility = require('./utility.js');
    var Dictionary = require('./dictionary.js');

    var Iterator = function(){};

    Iterator.prototype.next = function(callback){
        callback();
    };

    Iterator.prototype.toArray = function(callback){
        if(this._cachedArray){
            return callback(this._cachedArray);
        }

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
                self._cachedArray = results;

                callback(null, results);
            }
        };

        this.next(collect);
    };

    Iterator.prototype.toDictionary = function(compareSelector, callback){
        compareSelector = utility.createLambda(compareSelector);

        var dictionary = new Dictionary(compareSelector);

        this.toArray(function(err, array){
            if(err){
                return callback(err);
            }

            for(var i = 0; i < array.length; i++){
                dictionary.add(array[i], array[i]);
            }

            callback(null, dictionary);
        });
    };

    Iterator.prototype.toLookup = function(keySelector, elementSelector, compareSelector, callback){
        //Optional args support
        if(callback == null){
            callback = compareSelector;
            compareSelector = utility.identity;
        }

        if(callback == null){
            callback = elementSelector;
            elementSelector = utility.identity;
        }

        if(callback == null){
            callback = keySelector;
            keySelector = utility.identity;
        }

        this.toArray(function(err, array){
            if(err){
                return callback(err);
            }

            return callback(null, utility.arrayToLookup(array, keySelector, elementSelector, compareSelector));
        });

    };

    Iterator.prototype.dispose = function(callback){
        callback();
    };

    if(typeof exports !== 'undefined'){
        module.exports = Iterator;
    }
})();