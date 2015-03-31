;(function(){
	"use strict";
	
	var _none = function(value) { return typeof value === 'undefined' || typeof value === 'null' };
	var _string = function(value) { return typeof value === 'string' };
	var _async = function(callback, context, args) { setTimeout(function() { callback.call(context, args) }, 0); };

	var CableTopic = (function(){
		function CableTopic(name){
			this.name = name;
			this.events = Object.create(null);
			this.subscriptions = [];
		};

		CableTopic.prototype.ev = function(name){
			return this.events[name];
		};

		CableTopic.prototype.evOrCreate = function(name){
			var doCreate = _none(this.events[name]);
			if(doCreate){ this.events[name] = new CableEvent(name);	}
			return this.events[name];
		};

		CableTopic.prototype.sub = function(callback, context){
			var s = Object.create(null);
			s.callback = callback;
			s.context = context;
			this.subscriptions.push(s);
		};

		CableTopic.prototype.pub = function(arg){
			for(var i = 0; i < this.subscriptions.length; i++){
				_async(this.subscriptions[i].callback, this.subscriptions[i].context, arg);
			}
		};

		CableTopic.prototype.on = function(options){
			this.evOrCreate(options.ev).on(options);
		};

		CableTopic.prototype.off = function(options){
			if(_none(options.ev) || _none(options.id)){ return; }
			var ev = this.ev(options.ev);
			
			if(_none(ev)){ return; }
			ev.off(options.id);
		};

		CableTopic.prototype.out = function(ev, arg){
			ev = this.ev(ev);
			if(_none(ev)){ return; }
			ev.out(arg);
			this.pub(arg);
		};

		return CableTopic;
	})();

	var CableEvent = (function(){
		var incrementId = function(value){
			return 'CBLEV_' + (value + 1).toString();
		};

		function CableEvent(name){
			this.name = name;
			this.handlers = {};
			this.counter = 0;
			this.nextId = incrementId(this.counter);
		};

		CableEvent.prototype.on = function(options){
			if(_none(options.callback)) { return; }
			var id = !_string(options.id) ? incrementId(this.counter) : options.id;
			this.handlers[id] = Object.create(null);
			this.handlers[id].callback = options.callback;
			this.handlers[id].context = options.context;
		};

		CableEvent.prototype.off = function(id){
			delete this.handlers[id];
		};

		CableEvent.prototype.out = function(arg){
			for(var i in this.handlers){
				_async(this.handlers[i].callback, this.handlers[i].context, arg);			
			}
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
		}

		function Cable(topicSeperator){
			this.seperator = _string(topicSeperator) ? topicSeperator : '.';
			this.topics = Object.create(null);
			this.topics._other = new CableTopic();
		};

		Cable.prototype.topic = function(name){
			var doCreate = _none(this.topics[name]);
			if(doCreate){ this.topics[name] = new CableTopic(name);	}
			return this.topics[name];						
		};

		Cable.prototype.on = function(options) {
			if(!_string(options.ev)){ return ;}
			var sp = _spl(options.ev, this.seperator);
			options.ev = sp.event;

			return _string(sp.topic) 
				? this.topic(sp.topic).on(options)
				: this.topics._other.on(options);
		};

		Cable.prototype.off = function(options){
			if(_none(options.ev) || _none(options.id)){ return; }
			var sp = _spl(options.ev, this.seperator)
			options.ev = sp.event;
			return _string(sp.topic) 
				? this.topics[sp.topic].off(options) 
				: this.topics._other.off(options);
		};

		Cable.prototype.out = function(ev, arg) {
			if(!_string(ev)){ return; }
			var sp = _spl(ev, this.seperator)
			ev = sp.event;
			return _string(sp.topic) 
				? this.topics[sp.topic].out(ev, arg) 
				: this.topics._other.out(ev, arg);
		};

		return Cable;
	})();

	window.Cable = new Cable();
})();