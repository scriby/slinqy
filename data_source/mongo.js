(function(){
    var mongodb = require('mongodb');

    var MongoIterator = function(client, collection){
        this.client = client;
        this.collection = collection;
    };

    MongoIterator.prototype.next = function(callback){
        var self = this;

        var getNext = function(){
            self.cursor.nextObject(callback);
        };

        if(!this.client.openCalled){
            this.client.open(function(err){
                if(err){
                    return callback(err);
                }

                self.client.collection(self.collection, function(err, collection){
                    if(err){
                        return callback(err);
                    }

                    self.cursor = collection.find({});

                    getNext();
                });
            });
        } else {
            getNext();
        }
    };

    var MongoDataSource = function(dbName, mongoServer, port, options){
        var server;

        if(typeof mongoServer === 'string'){
            server = new mongodb.Server(mongoServer, port || 27017, options);
        } else {
            server = mongoServer;
        }

        this.client = new mongodb.Db(dbName, server);
    };

    MongoDataSource.prototype.getIterator = function(args){
        var collection = args.collection;

        return new MongoIterator(this.client, collection);
    };

    module.exports = MongoDataSource;
})();