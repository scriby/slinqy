(function(){
    var QueryExec = require('./query_exec.js');

    var Query = function(){
        this.steps = [];
    };

    Query.prototype.from = function(dataSourceType, collection){
        this.steps.push({ op: 'from', args: { dataSourceType: dataSourceType, collection: collection } });
        return this;
    };

    Query.prototype.select = function(selectorExpression){
        this.steps.push({ op: 'select', args: { selector: createLambda(selectorExpression) } });
        return this;
    };

    Query.prototype.take = function(take){
        this.steps.push({ op: 'take', args: { amount: take } });
        return this;
    };

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