var assert = require('assert');
var CBLJS = require('../src/cables');


describe('CableEvent', function(){
	describe('creation', function(){
		it('shouldn not fail', function(){
			assert.doesNotThrow(function() { var s = new CBLJS.CableEvent(); }, "Error in CableEvent constructor");
		});		

		it('should initialize correctly', function(){
			var name = 'TestEvent';
			var ce = new CBLJS.CableEvent(name);
			assert.strictEqual(ce.name, 'TestEvent', 'The name is incorrect: Expected ' + name + ' Actual ' + ce.name);
			assert.strictEqual(ce.counter, 0, 'The counter is incorrect: Expected 0, Actual ' + ce.counter);
			assert.notStrictEqual(typeof ce.handlers, 'undefined', 'The handlers object is undefined');
		});
	})
});

describe('Cable', function(){
	describe('creation', function(){
		it('shouldn not fail', function(){
			assert.doesNotThrow(function() { var s = new CBLJS.Cable(); }, "Error in Cable constructor");
		});

		it('should create a default seperator of "."', function(){
			var c = new CBLJS.Cable();
			assert.strictEqual(c.seperator, '.', 'The default seperator is not a full stop');
		});

		it('should allow supplying a custom seperator in the constructor', function(){
			var c = new CBLJS.Cable(':');
			assert.strictEqual(c.seperator, ':', 'A colon was supplied but ' + c.seperator + ' is the seperator');
		})
	});

	describe('topic', function(){
		var c = new CBLJS.Cable();
		it('shouldn not fail', function(){
			assert.doesNotThrow(function() { c.topic('test1'); }, "Error in topic function");
		});

		it('should create and return a topic', function(){
			var t = c.topic('test3');
			assert.notStrictEqual(typeof t, 'undefined', "No topic was returned");
			assert.notStrictEqual(typeof c.topics['test3'], 'undefined', "No topic was created on the cable");
			assert.strictEqual(t, c.topics['test3'], "The returned topic does not match the created topic");
		});
	});
});
