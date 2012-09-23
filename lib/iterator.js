(function(){
    var Iterator = function(){};

    Iterator.prototype.next = function(callback){
        callback();
    };

    Iterator.prototype.dispose = function(callback){
        callback();
    };

    if(typeof exports !== 'undefined'){
        module.exports = Iterator;
    }
})();