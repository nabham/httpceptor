(function () {

  const debug = require('debug')('info');

  function MemoryCache() {
    this.store = {};
  }

  MemoryCache.prototype.makeKey = function (key) {
    return `endpoint:rules:${key}`;
  }

  MemoryCache.prototype.setKey = function (key, val, options) {

    let storage = this.store;

    debug(`Setting cache with params - key:${key}, value:${val}, options:${options}`);

    if (options.hkey) {
      if (!this.store[options.hkey]) {
        this.store[options.hkey] = {};
      }
      storage = this.store[options.hkey];
    }

    storage[key] = val;

    return Promise.resolve('ok');
  }

  MemoryCache.prototype.getKey = function (key, options) {

    let storage = this.store;

    debug(`Getting cache with params - key:${key}, options:${options}`);

    if (options.hkey) {
      storage = this.store[options.hkey] || {};
    }

    return Promise.resolve(storage[key]);
  }

  MemoryCache.prototype.delKey = function (key, options) {

    let storage = this.store;

    debug(`Deleting cache with params - key:${key}, options:${options}`);

    if (options.hkey) {
      storage = this.store[options.hkey] || {};
    }

    delete storage[key];
    return Promise.resolve('ok');
  }

  MemoryCache.prototype.getAllKeys = function (key) {

    debug(`Getting all cache keys with params - key:${key}`);

    return Promise.resolve(this.store[key]);
  }

  module.exports = MemoryCache;

})();