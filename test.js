'use strict';

const test    = require('tape-promise')(require('tape'));
const YoRedis = require('./index');

const redis   = new YoRedis();

test('ping', function(t) {
  return redis.call('ping')
    .then(function(reply) {
      t.equal(reply, 'PONG');
    });
});

test('unknown command', function(t) {
  return redis.call('foo')
    .then(t.fail)
    .catch(function(error) {
      t.assert(error, 'throws');
    });
});

test('connection error', function(t) {
  const otherRedis = new YoRedis({ url: 'redis://127.0.0.1:9876' });
  return otherRedis.call('ping')
    .then(t.fail)
    .catch(function(error) {
      t.assert(error, 'throws');
    });
});

test('reconfigure with Promise', function(t) {
  let times = 0;
  const otherRedis = new YoRedis(function() {
    times++;
    return Promise.resolve({ url: 'redis://127.0.0.1:6379' });
  });
  return otherRedis.call('ping')
    .then(function(reply) {
      t.equal(times, 1);
      t.equal(reply, 'PONG');
      otherRedis.end();
      return otherRedis.call('echo', 'FOO');
    })
    .then(function(reply) {
      t.equal(times, 2);
      t.equal(reply, 'FOO');
      otherRedis.end();
    });
});

test.onFinish(function() {
  redis.end();
});
