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

  const toJSON = (str, fallback) => {

    try {
      const parseVal = JSON.parse(str);
      return parseVal || fallback || str;
    } catch (error) {
      console.log('parsing failed');
      return fallback || str;
    }
  }

  module.exports = {
    parseQueryParams,
    toJSON
  }

})();