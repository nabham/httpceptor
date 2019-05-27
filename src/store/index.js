(function () {

  function Store(type) {
    this.type = type;
    if (type === 'redis') {
      this.store = require('./redisStore');
    } else {
      this.store = require('./memoryStore').store;
    }
  }

  Store.prototype.add = function (key, val) {
    this.store[key] = val;
    return Promise.resolve(true);
  }

  Store.prototype.delete = function (key) {
    delete this.store[key];
    return Promise.resolve(true);
  }

  Store.prototype.has = function (key) {
    return Promise.resolve(this.store[key]);
  }

  Store.prototype.get = function (key) {
    return Promise.resolve(this.store[key]);
  }

  module.exports = Store;

})();