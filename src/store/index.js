(function () {

  const debug = require('debug')('info');

  function Store(type) {
    this.type = type;
    debug('Intializing store of type', type);
    let store = null;
    if (type === 'redis') {
      store = require('./redisCache');
    } else {
      store = require('./memoryCache');
    }
    this.store = new store();
  }

  Store.prototype.add = function (endpoint, key, val) {
    return this.store.setKey(key, val, { hkey: endpoint });
  }

  Store.prototype.edit = function (endpoint, key, val) {
    return this.store.setKey(key, val, { hkey: endpoint });
  }

  Store.prototype.delete = function (endpoint, key) {
    return this.store.delKey(key, { hkey: endpoint })
  }

  Store.prototype.get = function (endpoint, key) {
    return this.store.getKey(key, { hkey: endpoint });
  }

  Store.prototype.getAll = function (key) {
    return this.store.getAllKeys(key, { hkey: true });
  }

  module.exports = Store;

})();