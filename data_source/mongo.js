(function(){
    var MongoIterator = function(client, collection){
        this.client = client;
        this.collection = collection;
    };

    MongoIterator.prototype.next = function(callback){
        var self = this;

        var getNext = function(){
            self.cursor.nextObject(callback);
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