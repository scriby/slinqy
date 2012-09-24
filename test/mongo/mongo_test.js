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

    var tests = require('../datasource/datasource_tests.js');
    suite.addBatch(tests.getTests(function(callback){
        asyncblock(function(){
            var client = new mongodb.Db(TEST_DB_NAME, new mongodb.Server('127.0.0.1', 27017));
            client.open().sync();

            return new slinqy.DataSource.Mongo(client);
        }, callback);
    }));

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