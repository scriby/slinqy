var asyncblock = require('asyncblock');
if(asyncblock.enableTransform(module)) { return; }

var vows = require('vows');
var assert = require('assert');

var suite = vows.describe('mongo');
var mongodb = require('mongodb');
var slinqy = require('slinqy');

var TEST_DB_NAME = 'slinqy_test_db_name_aj38139381';

suite.addBatch({
    'When adding data to mongo': {
        topic: function(){
            asyncblock(function(){
                var client = new mongodb.Db(TEST_DB_NAME, new mongodb.Server('127.0.0.1', 27017));
                client.open().sync();
                client.dropDatabase().sync();

                var collection = client.collection('test').sync();

                var docs = [];
                for(var i = 1; i <= 100; i++){
                    docs.push({
                        number: i,
                        x2: i * 2
                    });
                }

                collection.insert(docs, { safe: true }).sync();

                client.close().sync();
            }, this.callback);
        },

        'Ok': function(){

        }
    }
});

suite.addBatch({
    'When enumerating the mongo data source': {
        topic: function(){
            asyncblock(function(){
                var mongo = new slinqy.DataSource.Mongo(TEST_DB_NAME, '127.0.0.1');

                var results = slinqy
                    .from(mongo, 'test')
                    .skip(10)
                    .take(10)
                    .select('$.number')
                    .toArray().sync();

                return results;
            }, this.callback);
        },

        'I get the expected results': function(results){
            assert.deepEqual(results, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        }
    }
});

suite.addBatch({
    'When dropping the database': {
        topic: function(){
            asyncblock(function(){
                var client = new mongodb.Db(TEST_DB_NAME, new mongodb.Server('127.0.0.1', 27017));
                client.open().sync();
                client.dropDatabase().sync();

                client.close().sync();
            }, this.callback);
        },

        'Ok': function(){

        }
    }
});

suite.export(module);