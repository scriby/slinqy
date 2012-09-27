(function(){
    var Dictionary = require('./dictionary.js');

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
        },

        arrayToLookup: function(array, keySelector, elementSelector, compareSelector){
            keySelector = utility.createLambda(keySelector);
            elementSelector = utility.createLambda(elementSelector);
            compareSelector = utility.createLambda(compareSelector);

            var dictionary = new Dictionary(compareSelector);

            for(var i = 0; i < array.length; i++){
                var key = keySelector(array[i]);
                var element = elementSelector(array[i]);

                var matched = dictionary.get(key);
                if(matched){
                    matched.push(element);
                } else {
                    dictionary.add(key, [ element ]);
                }
            }

            return dictionary;
        }
    };

    if(typeof exports !== 'undefined'){
        module.exports = utility;
    }
})();