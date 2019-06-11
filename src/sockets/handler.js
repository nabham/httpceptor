(function () {

  const socketStore = require('./memoryStore');
  const commonUtils = require('../utils/common');
  const debug = require('debug');

  const [debugInfo, debugWarn] = [debug('info'), debug('warn')];

  function socketHandler(socket) {

    const queryObj = commonUtils.parseQueryParams(socket.request.url);

    const socketId = queryObj.endPoint;

    if (!socketId) {
      debugWarn('No endpoint provided');
      socket.disconnect(true);
      return;
    }

    debugInfo('Creating socket connection for endpoint', socketId);
    socketStore.addSocket(socketId, socket);

    // socket.on('message', (message) => {
    //   console.log('message received from client', message);
    // });

    socket.on('disconnect', (reason) => {
      debugWarn('Socket disconnected because of', reason);
      socketStore.deleteSocket(socketId);
    });
  }

  function sendUpdate(endPoint, update) {
    const socket = socketStore.getSocket(endPoint);
    debugInfo('Sending update to client for endpoint', endPoint);
    if(socket) {
      socket.emit('message', update);
    } else {
      debugWarn('socket not found');
    }
  }

  module.exports = {
    socketHandler,
    sendUpdate
  }

})();