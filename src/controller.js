(function () {

  const mockUtils = require('./utils/mock');
  const sendUpdate = require('./sockets/handler').sendUpdate;
  let store;

  const initialize = (type) => {
    const Store = require('./store');
    store = new Store(type);
  };

  const handleCreateReq = (req, callback) => {
    const endPoint = req.body.endpoint;
    // console.log(store);
    store.has(endPoint)
      .then(exists => {
        if (exists) {
          // console.error(exists); v
          return callback({ code: 400, message: 'Already exists' });
        }

        return store.add(endPoint, mockUtils.newEndpoint())
          .then((resp) => {
            // console.log('resp', resp);
            callback(null);
          });

      })
      .catch(err => {
        console.error('error occured', err);
        callback({ code: 500, message: err });
      });
  };

  const handleMock = (req, callback) => {
    const endPoint = req.params.endpoint;
    store.get(endPoint)
      .then(config => {

        if (!config) {
          console.error(config);
          return callback({ code: 404, message: 'Endpoint does not exists' });
        }

        const method = req.method.toUpperCase();
        const path = '/' + req.params[0];

        const respObj = (config[path] && config[path][method]) || {};

        if (Object.keys(respObj).length === 0) {
          console.log('No config found');
          return Promise.reject('No config found for path', path);
        }

        // console.log(req.body);

        const code = respObj.code || 200;
        const response = respObj.response || 'PONG';

        setTimeout(() => {
          sendUpdate(endPoint, { code, response, method, headers: req.body || {}, path });
          callback(null, { code, response });
        }, (respObj.delay * 1000) || 0);

      })
      .catch(err => {
        console.error('error occured', err);
        callback({ code: 500, message: err });
      });
  }

  const handleEditRules = (req, callback) => {
    const { method, path, code, delay, body } = req.body;
    const endPoint = req.params.endpoint;

    store.get(endPoint)
      .then(config => {

        if (!config[path]) {
          config[path] = {};
        }

        config[path][method] = {
          code,
          response: body,
          delay
        };

        return store.add(endPoint, config)
          .then((resp) => {
            // console.log('resp', resp);
            callback(null);
          });

      })
      .catch(err => {
        console.error('error occured', err);
        callback({ code: 500, message: err });
      });;
  }

  const handleGetRules = (req, callback) => {
    const endPoint = req.params.endpoint;

    store.get(endPoint)
      .then(config => {
        callback(null, config);
      })
      .catch(err => {
        console.error('error occured', err);
        callback({ code: 500, message: err });
      });
  }

  const checkEndpoint = (req, callback) => {
    const endPoint = req.params.endpoint;
    // console.log(endPoint);
    store.has(endPoint)
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