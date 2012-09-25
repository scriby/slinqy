(function(){
    var MongoIterator = function(client, collection){
        this.client = client;
        this.collection = collection;
    };

    MongoIterator.prototype.next = function(callback){
        var self = this;

        var getNext = function(){
            self.cursor.nextObject(function(err, item){
                if(err){
                    return callback(err);
                }

                if(item === null){
                    //Convert nulls to undefined
                    return callback();
                } else {
                    return callback(null, item);
                }
            });
        };

        if(!this.cursor){
            self.client.collection(self.collection, function(err, collection){
                if(err){
                    return callback(err);
                }

                self.cursor = collection.find({});

                getNext();
            });
        } else {
            getNext();
        }
    };

    var MongoDataSource = function(client){
        this.client = client;
    };

    MongoDataSource.prototype.getIterator = function(args){
        var collection = args.collection;

        return new MongoIterator(this.client, collection);
    };

    module.exports = MongoDataSource;
})();