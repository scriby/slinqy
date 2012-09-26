(function(){
    var QueryExec = require('./query_exec.js');
    var utility = require('./utility.js');
    var Dictionary = require('./dictionary.js');

    var Query = function(){
        this.steps = [];
    };

    Query.prototype.from = function(dataSource, collection){
        this.steps.push({ op: 'from', args: { dataSource: dataSource, collection: collection } });
        return this;
    };

    Query.prototype.select = function(expression){
        this.steps.push({ op: 'select', args: { selector: utility.createLambda(expression) } });
        return this;
    };

    Query.prototype.where = function(expression){
        this.steps.push({ op: 'where', args: { expression: utility.createLambda(expression) }});
        return this;
    };

    Query.prototype.union = function(second, selector){
        this.steps.push({ op: 'union', args: { second: second, selector: utility.createLambda(selector) }});
        return this;
    };

    Query.prototype.unionAll = function(second){
        this.steps.push({ op: 'unionAll', args: { second: second }});
        return this;
    };

    Query.prototype.join = function(second, outerSelector, innerSelector, resultSelector){
        this.steps.push({ op: 'join', args: { second: second, outerSelector: utility.createLambda(outerSelector), innerSelector: utility.createLambda(innerSelector), resultSelector: utility.createLambda(resultSelector) }})
        return this;
    };

    Query.prototype.take = function(take){
        this.steps.push({ op: 'take', args: { amount: take } });
        return this;
    };

    Query.prototype.limit = Query.prototype.take;

    Query.prototype.skip = function(skip){
        this.steps.push({ op: 'skip', args: { amount: skip } });
        return this;
    };

    Query.prototype.toIterator = function(){
        var queryExec = new QueryExec();

        for(var i = 0; i < this.steps.length; i++){
            var step = this.steps[i];
            queryExec[step.op](step.args);
        }

        return queryExec.toIterator();
    };

    Query.prototype.toArray = function(callback){
        var iterator = this.toIterator();
        iterator.toArray(callback);
    };

    Query.prototype.toDictionary = function(compareSelector, callback){
        var iterator = this.toIterator();
        iterator.toDictionary(compareSelector, callback);
    };

    Query.prototype.next =  function(callback){
        if(!this.currIterator){
            this.currIterator = this.toIterator();
        }

        this.currIterator.next(callback);
    };

    if(typeof exports !== 'undefined'){
        module.exports = Query;
    }
})();