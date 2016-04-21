const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;
const events = new EventEmitter();
events.emit = Promise.promisify(events.emit);

module.exports = events;
