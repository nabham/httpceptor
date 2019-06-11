(function () {

  const defaultResponse = () => {
    return {
      code: 200,
      response: 'PONG',
      delay: 0
    }
  }

  const newEndpoint = () => {
    return {
      '/:GET': defaultResponse()
    }
  }

  module.exports = {
    newEndpoint,
    defaultResponse
  };

})();