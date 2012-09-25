var Dictionary = (function () {
    var functions = require('./functions.js');

    // static utility methods
    var hasOwnProperty = function(target, key) {
        return Object.prototype.hasOwnProperty.call(target, key);
    };

    var computeHashCode = function(obj) {
        if (obj === null) {
            return "null";
        } else if (obj === undefined) {
            return "undefined";
        } else {
            return JSON.stringify(obj);
        }
    };

    // LinkedList for Dictionary
    var HashEntry = function(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    };

    var EntryList = function() {
        this.first = null;
        this.last = null;
    };

    EntryList.prototype = {
        addLast: function(entry) {
            if (this.last != null) {
                this.last.next = entry;
                entry.prev = this.last;
                this.last = entry;
            } else {
                this.first = this.last = entry;
            }
        },

        replace: function(entry, newEntry) {
            if (entry.prev != null) {
                entry.prev.next = newEntry;
                newEntry.prev = entry.prev;
            } else {
                this.first = newEntry;
            }

            if (entry.next != null) {
                entry.next.prev = newEntry;
                newEntry.next = entry.next;
            } else {
                this.last = newEntry;
            }

        },

        remove: function(entry) {
            if (entry.prev != null) {
                entry.prev.next = entry.next;
            } else {
                this.first = entry.next;
            }

            if (entry.next != null) {
                entry.next.prev = entry.prev;
            } else {
                this.last = entry.prev;
            }
        }
    }

    // Overload:function()
    // Overload:function(compareSelector)
    var Dictionary = function (compareSelector) {
        this.count = 0;
        this.entryList = new EntryList();
        this.buckets = {}; // as Dictionary<string,List<object>>
        this.compareSelector = (compareSelector == null) ? functions.Identity : compareSelector;
    };

    Dictionary.prototype =
    {
        add: function(key, value) {
            var compareKey = this.compareSelector(key);
            var hash = computeHashCode(compareKey);
            var entry = new HashEntry(key, value);

            if (hasOwnProperty(this.buckets, hash)) {
                var array = this.buckets[hash];
                for (var i = 0; i < array.length; i++) {
                    if (this.compareSelector(array[i].key) === compareKey) {
                        this.entryList.replace(array[i], entry);
                        array[i] = entry;
                        return;
                    }
                }
                array.push(entry);
            } else {
                this.buckets[hash] = [entry];
            }

            this.count++;
            this.entryList.addLast(entry);
        },

        get: function(key) {
            var compareKey = this.compareSelector(key);
            var hash = computeHashCode(compareKey);
            if (!hasOwnProperty(this.buckets, hash)) {
                return;
            }

            var array = this.buckets[hash];
            for (var i = 0; i < array.length; i++) {
                var entry = array[i];
                if (this.compareSelector(entry.key) === compareKey) {
                    return entry.value;
                }
            }
            return;
        },

        set: function(key, value) {
            var compareKey = this.compareSelector(key);
            var hash = computeHashCode(compareKey);
            if (hasOwnProperty(this.buckets, hash)) {
                var array = this.buckets[hash];
                for (var i = 0; i < array.length; i++) {
                    if (this.compareSelector(array[i].key) === compareKey) {
                        var newEntry = new HashEntry(key, value);
                        this.entryList.replace(array[i], newEntry);
                        array[i] = newEntry;
                        return true;
                    }
                }
            }
            return false;
        },

        contains: function(key) {
            var compareKey = this.compareSelector(key);
            var hash = computeHashCode(compareKey);
            if (!hasOwnProperty(this.buckets, hash)) {
                return false;
            }

            var array = this.buckets[hash];
            for (var i = 0; i < array.length; i++) {
                if (this.compareSelector(array[i].key) === compareKey) {
                    return true;
                }
            }

            return false;
        },

        clear: function() {
            this.count = 0;
            this.buckets = {};
            this.entryList = new EntryList();
        },

        remove: function(key) {
            var compareKey = this.compareSelector(key);
            var hash = computeHashCode(compareKey);
            if (!hasOwnProperty(this.buckets, hash)) {
                return;
            }

            var array = this.buckets[hash];
            for (var i = 0; i < array.length; i++) {
                if (this.compareSelector(array[i].key) === compareKey) {
                    this.entryList.remove(array[i]);
                    array.splice(i, 1);
                    if (array.length == 0) {
                        delete this.buckets[hash];
                    }
                    this.count--;
                    return;
                }
            }
        },

        count: function() {
            return this.count;
        },

        toArray: function(){
            var results = [];

            var currentEntry = self.entryList.first;

            while(currentEntry != null) {
                results.push(currentEntry.value);
                currentEntry = currentEntry.next;
            }

            return results;
        }
    };

    if(typeof exports !== 'undefined'){
        module.exports = Dictionary;
    }
})();