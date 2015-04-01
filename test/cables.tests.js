var assert = require('assert');
var CBLJS = require('../src/cables');

describe('CableEvent', function(){
    var name = 'TestEvent';
    var idgen_1 = name + '_CBLEV_1';
    var idgen_2 = name + '_CBLEV_2';

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
            ce.on(h1.callback, h1.context, h1.id);
            assert.notStrictEqual(typeof ce.handlers[h1.id], 'undefined', 'The handler with ID ' + h1.id + ' was not created');
        });

        it('should throw an error if a callback function is not defined', function(){
            var captureThrow = function(){
                ce.on(h2.context, h2.id);
            }

            assert.throws(captureThrow);
        });

        it('should generate an ID if one is not supplied', function(){
            var result = ce.on(h1.callback, h1.context);
            assert.notStrictEqual(typeof ce.handlers[idgen_1], 'undefined', 'Expected generated id: ' + idgen_1 + ', actual was ' + result);
        });

        it('should increment to the next ID when another handler with no ID is created', function(){
            var result = ce.on(h3.callback, h3.context);
            assert.notStrictEqual(typeof ce.handlers[idgen_2], 'undefined', 'Expected generated id: ' + idgen_2 + ', actual was ' + result);
        });

        it('should correctly initialize the handler', function(){
            ce.on(h1.callback, h1.context, h1.id);
            assert.strictEqual(h1.callback, ce.handlers[h1.id].callback, 'The callback function supplied does not match the handler callback');
            assert.strictEqual(h1.context, ce.handlers[h1.id].context, 'The context object supplied does not match the handler context');
        });
    });

    describe('out', function(){
        var testVal = 25;

        var ob1 = {
            value: 10,
            update: function(v){
                this.value += v;
            }
        };

        var ob2 = {
            value: 20,
            update: function(v){
                this.value += v;
            }
        };

        it('should execute an attached handler', function(){
            var ce = new CBLJS.CableEvent(name);
            ob1.value = 10;
            var testRes = ob1.value + testVal;

            ce.on(ob1.update, ob1, 'testid');

            assert.strictEqual(ob1.value, 10, 'Handler executed before event was emitted');

            ce.out(testVal);

            assert.strictEqual(ob1.value, testRes, 'Expected updated value of ' + testRes + ' but actual value was ' + ob1.value);
        });

        it('can execute multiple handlers', function(){
            var ce = new CBLJS.CableEvent(name);
            ob1.value = 10;
            ob2.value = 20;
            var ob1Res = ob1.value + testVal;
            var ob2Res = ob2.value + testVal;

            ce.on(ob1.update, ob1, 'test1');
            ce.on(ob2.update, ob2, 'test2');

            ce.out(testVal);

            assert.strictEqual(ob1.value, ob1Res, 'Expected updated value of ' + ob1Res + ' for test1, actual was ' + ob1.value);
            assert.strictEqual(ob2.value, ob2Res, 'Expected updated value of ' + ob2Res + ' for test2, actual was ' + ob2.value);
        });

        it('should execute handlers in the provided context', function(){
            var ce = new CBLJS.CableEvent(name);
            ob1.value = 10;
            ob2.value = 20;

            var ob1Res = ob1.value + testVal;
            var ob2Res = ob2.value + testVal;

            ce.on(ob2.update, ob1, 'context_test');

            ce.out(testVal);

            assert.strictEqual(ob1.value, ob1Res, 'Expected OB1 to be updated through context to: ' + ob1Res + ', actual was ' + ob1.value);
            assert.notStrictEqual(ob2.value, ob2Res, 'Expected OB2 to not be updated. Expected: ' + ob2.value + ', actual was ' + ob2Res);
        });
    });

    describe('off', function(){
        var ob1 = {
            value: 10,
            update: function(v){
                this.value += v;
            }
        };

        it('should remove an attached handler', function(){
            var ce = new CBLJS.CableEvent(name);
            var id = ce.on(ob1.update, ob1);

            assert.notStrictEqual(typeof ce.handlers[id], 'undefined', 'The cable handler has not been created correctly');

            ce.off(id);

            assert.strictEqual(typeof ce.handlers[id], 'undefined', 'The handler still exists on the cable');
        })
    });
});

describe('CableTopic', function(){
    var topicName = 'TestTopic';
    describe('creation', function(){
        it('should not fail', function(){
            assert.doesNotThrow(function() { var s = new CBLJS.CableTopic(); }, 'Error in CableTopic constructor');
        });

        it('should initialize correctly', function(){
            var ct = new CBLJS.CableTopic(topicName);

            assert.strictEqual(ct.name, topicName, 'The expected value: ' + topicName + ', does not match the true value: ' + ct.name);
            assert.notStrictEqual(typeof ct.events, 'undefined', 'The events object was not initialized on the cable topic');
        });
    });

    describe('createEv', function(){
        it('should create a new CableEvent if none exists', function(){
            var eventName = 'test';
            var ct = new CBLJS.CableTopic(topicName);

            var result = ct.createEv(eventName);

            assert.strictEqual(result.name, eventName, 'The names supplied and returned do not match. Expected: ' + eventName + ', actual: ' + result.name);
            assert.strictEqual(typeof result.on, 'function', 'There is no "on" function for the created event');
            assert.strictEqual(typeof result.out, 'function', 'There is no "out" function for the created event');
            assert.strictEqual(typeof result.off, 'function', 'There is no "off" function for the created event');

            var attachedEvent = ct.events[result.name];

            assert.notStrictEqual(typeof attachedEvent, 'undefined', 'A cable event was returned but it is not attached to the topic');
        });

        it('should not overwrite an existing CableEvent', function(){
            var eventName = 'test';
            var handlerId = 'testevent';
            var ct = new CBLJS.CableTopic(topicName);

            var ob1 = {
                value: 10,
                update: function(v){
                    this.value += v;
                }
            };

            var attachedEvent = ct.createEv(eventName);
            attachedEvent.on(ob1.update, ob1, handlerId);

            assert.strictEqual(attachedEvent.handlers[handlerId].context, ob1, 'The handler was not correctly assigned to the event');            

            var secondEvent = ct.createEv(eventName);

            assert.notStrictEqual(typeof secondEvent.handlers[handlerId], 'undefined', 'The event was overwritten');
            assert.strictEqual(secondEvent.handlers[handlerId].context, ob1, 'The context of the handler has changed');
        });
    });

    describe('ev', function(){
        var eventName = 'test';
        it('should return an existing cable event', function(){
            var ct = new CBLJS.CableTopic(topicName);
            var attachedEvent = ct.createEv(eventName);

            assert.notStrictEqual(typeof attachedEvent, 'undefined', 'The event was not created.');

            var result = ct.ev(eventName);

            assert.notStrictEqual(typeof result, 'undefined', 'The event was not returned');
            assert.strictEqual(attachedEvent, result, 'The created event does not match the returned event');
        });

        it('should return undefined if no cable event exists', function(){
            var ct = new CBLJS.CableTopic(topicName);
            var attachedEvent = ct.createEv('fakeevent');
            var result = ct.ev(eventName);

            assert.strictEqual(typeof result, 'undefined', 'An event was returned that should not have existed');
        })
    });

    describe('on', function(){
        var eventName = 'test';
        var handlerId = 'testHandler';
        var ob1 = {
            value: 10,
            update: function(v){
                this.value += v;
            }
        };

        it('should create a new event if one does not exist', function(){            
            var ct = new CBLJS.CableTopic(topicName);
            var id = ct.on(eventName, ob1.update, ob1);
            var ev = ct.ev(eventName);

            assert.notStrictEqual(typeof ev, 'undefined', 'A new event was not created');
        });

        it('should attach a new handler to the event', function(){
            var ct = new CBLJS.CableTopic(topicName);
            var id = ct.on(eventName, ob1.update, ob1, handlerId);
            var ev = ct.ev(eventName);

            assert.notStrictEqual(typeof ev, 'undefined', 'A new event was not created');
            assert.notStrictEqual(typeof ev.handlers[handlerId], 'undefined', 'The handler: ' + handlerId + ' was not created on the event');            
        });
    });

    describe('off', function(){
        var eventName = 'test';
        var handlerId = 'testHandler';
        var testVal = 20;
        var ob1 = {
            value: 10,
            update: function(v){
                this.value += v;
            }
        };

        it('should remove a handler from an event', function(){
            var ct = new CBLJS.CableTopic(topicName);
            var id = ct.on(eventName, ob1.update, ob1, handlerId);

            var expect = testVal + ob1.value;

            ct.out(eventName, testVal);

            assert.strictEqual(expect, ob1.value, 'The expected value was not returned despite the event being still attached');

            ob1.value = 10;
            expect = ob1.value;
            ct.off(eventName, handlerId);

            ct.out(eventName, testVal);

            assert.strictEqual(expect, ob1.value, 'The handler was not removed from the event. Expected: ' + expect + ', actual: ' + ob1.value);
        });
    });
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
