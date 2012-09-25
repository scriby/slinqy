(function(){
    var QueryExec = require('./query_exec.js');

    var Query = function(){
        this.steps = [];
    };

    Query.prototype.from = function(dataSource, collection){
        this.steps.push({ op: 'from', args: { dataSource: dataSource, collection: collection } });
        return this;
    };

    Query.prototype.select = function(expression){
        this.steps.push({ op: 'select', args: { selector: createLambda(expression) } });
        return this;
    };

    Query.prototype.where = function(expression){
        this.steps.push({ op: 'where', args: { expression: createLambda(expression) }});
        return this;
    };

    Query.prototype.union = function(second, selector){
        this.steps.push({ op: 'union', args: { selector: createLambda(selector) }});
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

    Query.prototype.next = (function(){
        var iterator;

        return function(callback){
            if(!iterator){
                iterator = this.toIterator();
            }

            iterator.next(callback);
        };
    })();

    var identityFunction = function(){};
    var createLambda = function(expression){
        if (expression == null) {
            return identityFunction;
        }

        if (typeof expression === 'string') {
            if (expression == "") {
                return identityFunction;
            } else if (expression.indexOf("=>") == -1) {
                return new Function("$,$$,$$$,$$$$", "return " + expression);
            } else {
                var expr = expression.match(/^[(\s]*([^()]*?)[)\s]*=>(.*)/);
                return new Function(expr[1], "return " + expr[2]);
            }
        }

        return expression;
    };

    if(typeof exports !== 'undefined'){
        module.exports = Query;
    }
})();