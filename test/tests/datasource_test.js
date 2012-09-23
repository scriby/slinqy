var asyncblock = require('asyncblock');
if(asyncblock.enableTransform(module)) { return; }

var vows = require('vows');
var assert = require('assert');

var TestDataSource = require('../datasource/test_datasource.js');

var suite = vows.describe('datasource');

suite.addBatch({
    'When enumerating the test data source': {
        topic: function(){
            asyncblock(function(){
                var results = [];

                var ds = new TestDataSource();
                var iterator = ds.getIterator({});

                for(var i = 0; i < 10; i++){
                    results[i] = iterator.next().sync().number;
                }

                return results;
            }, this.callback);
        },

        'I get the expected results': function(results){
            assert.deepEqual(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        }
    }
});

suite.export(module);