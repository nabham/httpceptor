(function () {

  const mockUtils = require('./utils/mock');
  const commonUtils = require('./utils/common');
  const sendUpdate = require('./sockets/handler').sendUpdate;
  const debug = require('debug');

  const [debugError, debugInfo, debugWarn] = [debug('error'), debug('info'), debug('warn')];

  let store;

  const initialize = (type) => {
    const Store = require('./store');
    store = new Store(type);
  };

  const handleCreateReq = (req, callback) => {
    const endPoint = req.body.endpoint;
    store.get(undefined, endPoint)
      .then(exists => {
        if (exists) {
          // debugError(exists); v
          return callback({ code: 400, message: 'Already exists' });
        }

        return store.add(endPoint, '/:GET', mockUtils.defaultResponse())
          .then((resp) => {
            callback(null);
          });

      })
      .catch(err => {
        debugError('error occured', err);
        callback({ code: 500, message: err });
      });
  };

  const handleMock = (req, callback) => {

    const endPoint = req.params.endpoint,
      method = req.method.toUpperCase(),
      path = '/' + req.params[0];

    store.get(endPoint, `${path}:${method}`)
      .then(config => {

        if (typeof (config) === 'string') {
          config = commonUtils.toJSON(config);
        }

        if (!config) {
          debugWarn(config);
          return callback({ code: 404, message: 'Endpoint does not exists' });
        }

        if (Object.keys(config).length === 0) {
          debugInfo('No config found');
          return Promise.reject('No config found for path', path);
        }

        const code = config.code || 200;
        const response = config.response || 'PONG';

        setTimeout(() => {
          sendUpdate(endPoint, { code, response, method, body: req.body || {}, path });
          callback(null, { code, response });
        }, (config.delay * 1000) || 0);

      })
      .catch(err => {
        debugError('error occured', err);
        callback({ code: 500, message: err });
      });
  }

  const handleEditRules = (req, callback) => {
    const { method, path, code, delay, body } = req.body;
    const endPoint = req.params.endpoint;

    store.edit(endPoint, `${path}:${method}`, { code, response: body, delay })
      .then(() => {
        callback(null);
      })
      .catch(err => {
        debugError('error occured', err);
        callback({ code: 500, message: err });
      });;
  }

  const handleGetRules = (req, callback) => {
    const endPoint = req.params.endpoint;

    store.getAll(endPoint)
      .then(config => {
        callback(null, config);
      })
      .catch(err => {
        debugError('error occured', err);
        callback({ code: 500, message: err });
      });
  }

  const checkEndpoint = (req, callback) => {
    const endPoint = req.params.endpoint;
    // console.log(endPoint);
    store.getAll(endPoint)
      .then(exists => {
        callback(exists);
      })
      .catch(() => {
        callback(false);
      });
  }

  module.exports = {
    initialize,
    handleCreateReq,
    handleMock,
    checkEndpoint,
    handleEditRules,
    handleGetRules
  };

})();