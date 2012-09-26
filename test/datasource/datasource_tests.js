var asyncblock = require('asyncblock');
if(asyncblock.enableTransform(module)) { return; }

var assert = require('assert');
var slinqy = require('slinqy');

exports.getTests = function(getDataSource){
    return {
        'When selecting from the data source (1)': {
            topic: function(){
                asyncblock(function(){
                    var results = slinqy
                        .from(getDataSource().sync(), 'test')
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
        },

        'When selecting from the data source (2)': {
            topic: function(){
                asyncblock(function(){
                    var results = [];

                    var iterator = slinqy
                        .from(getDataSource().sync(), 'test')
                        .skip(10)
                        .take(10)
                        .select('$.number')
                        .toIterator();

                    var next = iterator.next().sync();
                    while(next !== undefined){
                        results.push(next);
                        next = iterator.next().sync();
                    }

                    return results;
                }, this.callback);
            },

            'I get the expected results': function(results){
                assert.deepEqual(results, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
            }
        },

        'When selecting from the data source with a where clause (1)': {
            topic: function(){
                asyncblock(function(){
                    var results = slinqy
                        .from(getDataSource().sync(), 'test')
                        .skip(10)
                        .take(10)
                        .select('$.number')
                        .where('$ % 2 === 0')
                        .toArray().sync();

                    return results;
                }, this.callback);
            },

            'I get the expected results': function(results){
                assert.deepEqual(results, [12, 14, 16, 18, 20]);
            }
        },

        'When selecting from the data source with a where clause (2)': {
            topic: function(){
                asyncblock(function(){
                    var results = slinqy
                        .from(getDataSource().sync(), 'test')
                        .where('$.number % 2 === 0')
                        .skip(10)
                        .take(10)
                        .select('$.number')
                        .toArray().sync();

                    return results;
                }, this.callback);
            },

            'I get the expected results': function(results){
                assert.deepEqual(results, [22, 24, 26, 28, 30, 32, 34, 36, 38, 40]);
            }
        },

        'Union (1)': {
            topic: function(){
                asyncblock(function(){
                    var results = slinqy
                        .from(getDataSource().sync(), 'test')
                        .select('$.number')
                        .where('$ < 11')
                        .take(10)
                        .union(
                            slinqy.from(getDataSource().sync(), 'test')
                                .select('$.number')
                                .where('$ > 5')
                                .take(10)
                        )
                        .toArray().sync();

                    return results;
                }, this.callback);
            },

            'Results': function(results){
                assert.deepEqual(results, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ])
            }
        },

        'Union all (1)': {
            topic: function(){
                asyncblock(function(){
                    var results = slinqy
                        .from(getDataSource().sync(), 'test')
                        .select('$.number')
                        .where('$ < 11')
                        .take(10)
                        .unionAll(
                            slinqy.from(getDataSource().sync(), 'test')
                                .select('$.number')
                                .where('$ > 5')
                                .take(10)
                        )
                        .toArray().sync();

                    return results;
                }, this.callback);
            },

            'Results': function(results){
                assert.deepEqual(results, [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ])
            }
        },

        'Join (1)': {
            topic: function(){
                asyncblock(function(){
                    var results = slinqy
                        .from(getDataSource().sync(), 'test')
                        .where('$.number < 11')
                        .take(10)
                        .join(
                            slinqy.from(getDataSource().sync(), 'test')
                                .where('$.number > 5')
                                .take(10),
                            '$.number',
                            '$.number',
                            'n1,n2=> { n1: n1, n2: n2 }'
                        )
                        .toArray().sync();

                    return results;
                }, this.callback);
            },

            'Results': function(results){
                assert.equal(results, [ 6, 7, 8, 9, 10 ]);
            }
        }
    };
};