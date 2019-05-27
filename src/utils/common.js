(function(){

  const parseQueryParams = (url) => {
    const queryString = url.split('?')[1];

    const query = {};

    const pairs = queryString.split('&');

    for(let i=0; i<pairs.length; i++) {
      let pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }

    return query;
  }

  module.exports = {
    parseQueryParams
  }

})();