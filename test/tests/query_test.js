var asyncblock = require('asyncblock');
if(asyncblock.enableTransform(module)) { return; }

var vows = require('vows');
var assert = require('assert');
var slinqy = require('slinqy');

var TestDataSource = require('../datasource/test_datasource.js');

var suite = vows.describe('query');

suite.addBatch({
    'When querying the test data source using toIterator': {
        topic: function(){
            asyncblock(function(){
                var results = [];

                var iterator = slinqy
                    .from(new TestDataSource(), 'numbers')
                    .select('$.number')
                    .skip(10)
                    .take(10)
                    .toIterator();

                for(var i = 0; i < 10; i++){
                    results[i] = iterator.next().sync();
                }

                return results;
            }, this.callback);
        },

        'I get the expected results': function(results){
            assert.deepEqual(results, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        }
    },

    'When querying the test data source toArray': {
        topic: function(){
            asyncblock(function(){
                var results = slinqy
                    .from(new TestDataSource(), 'numbers')
                    .select('$.number')
                    .skip(10)
                    .take(10)
                    .toArray().sync();

                return results;
            }, this.callback);
        },

        'I get the expected results': function(results){
            assert.deepEqual(results, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        }
    }
});

suite.export(module);