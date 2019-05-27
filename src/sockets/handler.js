(function () {

  const socketStore = require('./memoryStore');
  const commonUtils = require('../utils/common');

  function socketHandler(socket) {

    // console.log(socket.request.url);

    // console.log('---');
    // console.log(socket.hanshake);

    const queryObj = commonUtils.parseQueryParams(socket.request.url);

    const socketId = queryObj.endPoint;

    if (!socketId) {
      console.log('No endpoint provided');
      socket.disconnect(true);
      return;
    }

    socketStore.addSocket(socketId, socket);

    socket.on('message', (message) => {
      console.log('message received from client', message);
    });

    // setInterval(() => {
    // socket.emit('message', { code: 200, method: 'GET' });
    // }, 1000);


    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected because of', reason);
      socketStore.deleteSocket(socketId);
    });
  }

  function sendUpdate(endPoint, update) {
    const socket = socketStore.getSocket(endPoint);
    if(socket) {
      socket.emit('message', update);
    } else {
      console.log('socket not found');
    }
  }

  module.exports = {
    socketHandler,
    sendUpdate
  }

})();