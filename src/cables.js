/*jshint -W089 */
/*jshint node: true */
;(function(){
    "use strict";

    var _none = function(value) { return typeof value === 'undefined' || value === null; };
    var _string = function(value) { return typeof value === 'string'; };
    var _function = function(value) { return typeof value === 'function'; };

    var CableTopic = (function(){
        function CableTopic(name){
            this.name = name;
            this.events = Object.create(null);
        }

        CableTopic.prototype.createEv = function(name){
            var doCreate = _none(this.events[name]);
            if(doCreate){ this.events[name] = new CableEvent(name); }
            return this.events[name];
        };

        CableTopic.prototype.ev = function(name){
            return this.events[name];
        };

        CableTopic.prototype.on = function(evName, callback, context, id){
            var ev = this.createEv(evName)
            return ev.on(callback, context, id);
        };

        CableTopic.prototype.off = function(evName, id){
            if(_none(evName) || _none(id)){ return; }
            var ev = this.ev(evName);

            if(_none(ev)){ return; }
            ev.off(id);
        };

        CableTopic.prototype.out = function(ev, arg){
            ev = this.ev(ev);
            if(_none(ev)){ return; }
            return ev.out(arg);
        };

        return CableTopic;
    })();

    var CableEvent = (function(){
        var incrementId = function(name, value){
            return name + '_CBLEV_' + (value + 1).toString();
        };

        function CableEvent(name){
            this.name = name;
            this.handlers = {};
            this.counter = 0;
        }

        CableEvent.prototype.on = function(callback, context, id){
            if(!_function(callback)){
                throw 'CableEvent.on expects a callback function as it\'s first argument';
            }

            if(!_string(id)){
                id = incrementId(this.name, this.counter);
                this.counter++;
            }

            this.handlers[id] = Object.create(null);
            this.handlers[id].callback = callback;
            this.handlers[id].context = context;

            return id;
        };

        CableEvent.prototype.off = function(id){
            delete this.handlers[id];
            return this;
        };

        CableEvent.prototype.out = function(arg){
            for(var i in this.handlers){
                this.handlers[i].callback.call(this.handlers[i].context, arg);  
            }

            return this;
        };

        return CableEvent;
    })();

    var Cable = (function(){
        var _spl = function(ev, sep){
            var sp = ev.split(sep);
            var res = Object.create(null);
            if(sp.length === 1){
                res.event = sp[0];
            }
            else{
                res.topic = sp[0];
                res.event = sp[1];
            }
            return res;
        };

        function Cable(topicSeperator){
            this.seperator = _string(topicSeperator) ? topicSeperator : '.';
            this.topics = Object.create(null);
            this.topics._other = new CableTopic();
        }

        Cable.prototype.topic = function(name){
            var doCreate = _none(this.topics[name]);
            if(doCreate){ this.topics[name] = new CableTopic(name); }
            return this.topics[name];           
        };

        Cable.prototype.on = function(eventString, callback, context, handlerId) {
            if(!_string(eventString)){ return ;}
            var sp = _spl(eventString, this.seperator);
            eventString = sp.event;

            return _string(sp.topic) 
            ? this.topic(sp.topic).on(sp.event, callback, context, handlerId)
            : this.topics._other.on(sp.event, callback, context, handlerId);
        };

        Cable.prototype.off = function(eventString, handlerId){
            if(_none(eventString) || _none(handlerId)){ return; }
            var sp = _spl(eventString, this.seperator);
            return _string(sp.topic) 
            ? this.topics[sp.topic].off(sp.event, handlerId) 
            : this.topics._other.off(sp.event, handlerId);
        };

        Cable.prototype.out = function(ev, arg) {
            if(!_string(ev)){ return; }
            var sp = _spl(ev, this.seperator);
            ev = sp.event;
            return _string(sp.topic) 
            ? this.topics[sp.topic].out(ev, arg) 
            : this.topics._other.out(ev, arg);
        };

        return Cable;
    })();

    var CBLJS = Object.create(null);
    CBLJS.Cable = Cable;
    CBLJS.CableTopic = CableTopic;
    CBLJS.CableEvent = CableEvent;

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = CBLJS;
        }
        exports.CBLJS = CBLJS;
    } 
    else {
        this.CBLJS = CBLJS;
    }

})(this);