var slinqy = require('slinqy');

(function(){
    var NumberIterator = function(args){
        this.skip = args.skip || 0;
        this.take = args.take;

        this.current = 0;
    };
    NumberIterator.prototype = new slinqy.Iterator();
    NumberIterator.prototype.constructor = NumberIterator;

    NumberIterator.prototype.next = function(callback){
        this.current++;
        if(this.current < this.take || this.take == null){
            return callback(null, { number: this.current + this.skip });
        } else {
            return callback();
        }
    };

    NumberIterator.prototype.dispose = function(callback){
        callback();
    };

    var TestDataSource = function(){};
    TestDataSource.prototype = new slinqy.DataSource();
    TestDataSource.prototype.constructor = TestDataSource;

    TestDataSource.prototype.getIterator = function(args){
        return new NumberIterator({ skip: args.skip, take: args.take });
    };

    if(typeof exports !== 'undefined'){
        module.exports = TestDataSource;
    }
})();