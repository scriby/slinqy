var asyncblock = require('asyncblock');
if(asyncblock.enableTransform(module)) { return; }

var vows = require('vows');
var assert = require('assert');

var TestDataSource = require('../datasource/number_datasource.js');

var suite = vows.describe('test datasource');

var tests = require('../datasource/datasource_tests.js');
suite.addBatch(tests.getTests(function(callback){
    return callback(null, new TestDataSource());
}));

suite.export(module);