(function(){
    var utility = {
        identity: function(x) { return x; },

        createLambda: function(expression){
            if (expression == null) {
                return utility.identity;
            }

            if (typeof expression === 'string') {
                if (expression == "") {
                    return utility.identity;
                } else if (expression.indexOf("=>") == -1) {
                    return new Function("$,$$,$$$,$$$$", "return " + expression);
                } else {
                    var expr = expression.match(/^[(\s]*([^()]*?)[)\s]*=>(.*)/);
                    return new Function(expr[1], "return " + expr[2]);
                }
            }

            return expression;
        }
    };

    if(typeof exports !== 'undefined'){
        module.exports = utility;
    }
})();