var assert = require('assert');
var CBLJS = require('../src/cables');


describe('CableEvent', function(){
    var name = 'TestEvent';
    var idgen_1 = 'CBLEV_1';
    var idgen_2 = 'CBLEV_2';

    describe('creation', function(){
        it('shouldn not fail', function(){
            assert.doesNotThrow(function() { var s = new CBLJS.CableEvent(); }, "Error in CableEvent constructor");
        });   

        it('should initialize correctly', function(){
            var ce = new CBLJS.CableEvent(name);
            assert.strictEqual(ce.name, 'TestEvent', 'The name is incorrect: Expected ' + name + ' Actual ' + ce.name);
            assert.strictEqual(ce.counter, 0, 'The counter is incorrect: Expected 0, Actual ' + ce.counter);
            assert.notStrictEqual(typeof ce.handlers, 'undefined', 'The handlers object is undefined');
        });
    });

    describe('on', function(){
        var ce = new CBLJS.CableEvent(name);
        var h1 = { callback: function() {}, context: 'testcontext', id: 'testid1' };
        var h2 = { context: 'testcontext', id: 'testid2' };
        var h3 = { callback: function() {}, context: 'testcontext' };

        it('should add a handler if a callback function is defined', function(){
            ce.on(h1);
            assert.notStrictEqual(typeof ce.handlers[h1.id], 'undefined', 'The handler with ID ' + h1.id + ' was not created');
        });

        it('should not add a handler if no callback function is defined', function(){
            ce.on(h2);
            assert.strictEqual(typeof ce.handlers[h2.id], 'undefined', 'The handler with ID ' + h2.id + ' was created with no callback function');
        });

        it('should generate an ID if one is not supplied', function(){
            ce.on(h3);
            assert.notStrictEqual(typeof ce.handlers[idgen_1], 'undefined', 'A handler was not generated with the ID ' + idgen_1);
        });

        it('should increment to the next ID when another handler with no ID is created', function(){
            ce.on(h3);
            assert.notStrictEqual(typeof ce.handlers[idgen_2], 'undefined', 'A handler was not generated with the ID ' + idgen_2);
        });

        it('should correctly initialize the handler', function(){
            ce.on(h1);
            assert.strictEqual(h1.callback, ce.handlers[h1.id].callback, 'The callback function supplied does not match the handler callback');
            assert.strictEqual(h1.context, ce.handlers[h1.id].context, 'The context object supplied does not match the handler context');
        });
    });

describe('out', function(){
    var ce = new CBLJS.CableEvent(name);

    it('should execute an attached handler', function(){
        var testVal = 25;
        var obj = {
            value: 10,
            update: function(v){
                this.value += v;
            }
        };

        var testRes = obj.value + testVal;

        ce.on({ callback: obj.update, context: obj, id: 'testid' });

        assert.strictEqual(obj.value, 10, 'Handler executed before event was emitted');

        ce.out(testVal);

        assert.strictEqual(obj.value, testRes, 'Expected updated value of ' + testRes + ' but actual value was ' + obj.value);
    })
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
