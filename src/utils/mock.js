(function () {

  const defaultResponse = () => {
    return {
      code: 200,
      response: 'PONG'
    }
  }

  const newEndpoint = () => {
    return {
      '/': {
        'GET': defaultResponse(),
        'POST': defaultResponse(),
        'PUT': defaultResponse(),
        'DELETE': defaultResponse()
      }
    }
  }

  module.exports = {
    newEndpoint
  };

})();