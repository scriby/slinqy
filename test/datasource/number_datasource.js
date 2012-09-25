var slinqy = require('slinqy');

(function(){
    var NumberIterator = function(){
        this.current = 0;
    };
    NumberIterator.prototype = new slinqy.Iterator();
    NumberIterator.prototype.constructor = NumberIterator;

    NumberIterator.prototype.next = function(callback){
        this.current++;

        return callback(null, { number: this.current, x2: this.current * 2 });
    };

    NumberIterator.prototype.dispose = function(callback){
        callback();
    };

    var TestDataSource = function(){};
    TestDataSource.prototype = new slinqy.DataSource();
    TestDataSource.prototype.constructor = TestDataSource;

    TestDataSource.prototype.getIterator = function(){
        return new NumberIterator();
    };

    if(typeof exports !== 'undefined'){
        module.exports = TestDataSource;
    }
})();