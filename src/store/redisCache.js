(function () {

  const redisConf = require('../../config.json').redisConn;
  const redisConn = require('./redisConn');
  const util = require('util');
  const debug = require('debug')('info');

  function RedisCache(cb) {
    this.cache = redisConn.initialize(redisConf, cb);
  }

  RedisCache.prototype.makeKey = function (key) {
    return `endpoint:rules:${key}`;
  }

  RedisCache.prototype.setKey = function (key, val, options) {
    const db = this.cache.getDb();

    if(!db) {
      return Promise.reject('Redis connection not initialized');
    }

    if (typeof (val) === 'object') {
      val = JSON.stringify(val);
    }

    debug(`Setting cache with params - key:${key}, value:${val}, options:${options}`);

    if (options.hkey) {
      return util.promisify(db.hset).bind(db)(this.makeKey(options.hkey), key, val);
    }

    return util.promisify(db.set).bind(db)(this.makeKey(key), val);
  }

  RedisCache.prototype.getKey = function (key, options) {
    const db = this.cache.getDb();

    if(!db) {
      return Promise.reject('Redis connection not initialized');
    }

    debug(`Getting cache with params - key:${key}, options:${options}`);

    if (options.hkey) {
      return util.promisify(db.hget).bind(db)(this.makeKey(options.hkey), key);
    }

    return util.promisify(db.get).bind(db)(this.makeKey(key));
  }

  RedisCache.prototype.delKey = function (key, options) {
    const db = this.cache.getDb();

    if(!db) {
      return Promise.reject('Redis connection not initialized');
    }

    debug(`Deleting cache with params - key:${key}, options:${options}`);

    if (options.hkey) {
      return util.promisify(db.hdel).bind(db)(this.makeKey(options.hkey), key);
    }

    return util.promisify(db.del).bind(db)(this.makeKey(key));
  }

  RedisCache.prototype.getAllKeys = function (key, options) {
    const db = this.cache.getDb();

    if(!db) {
      return Promise.reject('Redis connection not initialized');
    }

    debug(`Getting all cache keys with params - key:${key}`);

    if (options.hkey) {
      return util.promisify(db.hgetall).bind(db)(this.makeKey(key));
    }

    return util.promisify(db.keys).bind(db)(this.makeKey(key));
  }

  module.exports = RedisCache;

})();