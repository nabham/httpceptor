(function(){

  const redis = require('redis');
  const debug = require('debug');

  const [debugError, debugInfo] = [debug('error'), debug('info')];

  function Redis(options, cb) {
    this.client = null;

    this.connect(options, cb);
  }

  Redis.prototype.connect = function(options, cb) {

    debugInfo('Initiating redis connection');

    const client = redis.createClient(Object.assign({}, options, {
      retry_strategy: (optionsObj) => {
        debugInfo('Redis connection failed. Retrying...');
        return Math.min(30000, optionsObj.attempt * 1000);
      }
    }));

    client.on('connect', () => {
      debugInfo('Redis connected successfully');
    });

    client.once('ready', () => {
      if(cb) {
        cb();
      }
      this.client = client;
    });

    client.on('end', (err) => {
      debugError('Redis connection closed', err);
    });

    client.on('error', (err) => {
      debugError('Redis disconnected due to', err);
    });

  }

  Redis.prototype.getDb = function() {
    return this.client;
  }

  module.exports = {
    initialize: (options, cb) => new Redis(options, cb)
  }

})();