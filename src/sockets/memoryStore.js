(function(){

  let sockets = {};

  const addSocket = (socketId, socket) => {
    sockets[socketId] = socket;
  }

  const deleteSocket = (socketId) => {
    delete sockets[socketId];
  }

  const deleteAllSocket = () => {
    sockets = {};
  }

  const getSocket = (socketId) => {
    return sockets[socketId] || null;
  }

  module.exports = {
    addSocket,
    getSocket,
    deleteSocket
  }

})();