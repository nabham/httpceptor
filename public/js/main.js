var appState = {};

function createEndpoint() {

  const endpoint = document.getElementById('endpoint').value;

  if (endpoint.length < 6) {
    return createToaster('endpoint length should be more than 5 characters', 'red');
  }

  fetch('/api/endpoint/create', {
    method: 'post',
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ endpoint })
  })
    .then(resp => {
      if (resp.status !== 200) {
        return Promise.reject(404);
      }
      saveInStore(endpoint);
      window.location = '/main/' + endpoint;
    })
    .catch((err) => {
      console.error('Request failed', err);
      createToaster('Failed to create endpoint. ' + err, 'red');
    })
}

function getAllEndpoints() {
  
  fetch('/api/rules/' + window.endPointId, {
    method: 'get',
    headers: {
      'Content-type': 'application/json'
    }
  })
  .then(resp => {
    if (resp.status !== 200) {
      return Promise.reject(404);
    }
    return resp.json();
    })
  .then((resp) => {
    appState.rules = resp.data;
    createRulesList(resp.data);
  }).catch((err) => {
    console.error('Request failed', err);
    createToaster('Failed to get rules. ' + err, 'red');
  })
}

function saveConfig() {
  const method = getDOMElement('rule_method').value;
  let path = getDOMElement('rule_path').value;
  const code = getDOMElement('rule_code').value || 200;
  const delay = getDOMElement('rule_delay').value || 0;
  const body = getDOMElement('rule_body').value || '';

  console.log(method, path, code, delay, body);

  if(isNaN(parseInt(code)) || isNaN(parseInt(delay))) {
    return createToaster('Incorrect code or delay', 'red');
  }

  if(path[0] !== '/') {
    path = '/' + path;
  }

  fetch('/api/rules/edit/' + window.endPointId, {
    method: 'post',
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ method, path, code, delay, body })
  })
    .then(resp => {
      if (resp.status !== 200) {
        return Promise.reject(404);
      }
      // saveInStore(endpoint);
      // window.location = '/main/' + endpoint;
      createToaster('Rule saved successfully', 'green');
      getAllEndpoints();
    })
    .catch((err) => {
      console.error('Request failed', err);
      createToaster('Failed to create endpoint. ' + err, 'red');
    });

}

function socketHandler(message) {

  console.log(message);

  if (!message.code || !message.method) {
    return;
  }

  const mainContent = document.getElementById('main-container');

  const successCode = (parseInt(message.code) / 100) == 2;

  const newDomStr = `<div class="collapsible-header response-card pad-10">
    <div class="response-code bg-darkgray">${message.method}</div>
    <div class="response-code bg-bluegrey">${message.path}</div>
    <div class="response-code ${successCode ? 'bg-green' : 'bg-red'}">${message.code}</div>
  </div>
  <div class="collapsible-body pad-15">
    <div class="update-resp">
      <div class="response-card">
        <div>Headers</div>
        <div>Response</div>
      </div>
      <div class="response-card">
        <pre>${JSON.stringify(message.headers)}</pre>
        <pre>${message.response}</pre>
      </div>
    </div>
  </div>`;

  getDOMElement('empty-container').style.display = 'none';

  const newList = document.createElement('li');
  newList.innerHTML = newDomStr;

  mainContent.insertBefore(newList, mainContent.firstChild);

}

function createToaster(string, classes) {
  M.toast({ html: string, classes });
}

function getEndpints() {
  const endPointsObj = getFromStore();

  if(endPointsObj) {
    let domStr = '';
    Object.keys(endPointsObj).forEach(endpoint => {
      domStr += ` <a href="/main/${endpoint}">${endpoint}</a>,`;
    });

    if(domStr) {
      domStr = domStr.slice(0, domStr.length - 1);
    }

    const elem = document.getElementById('last-endpoints');
    elem.innerHTML = domStr;
  }
}

function saveInStore(endpoint) {
  const currEndpoints = getFromStore() || {};
  currEndpoints[endpoint] = Date.now();
  localStorage.setItem('httpceptor', JSON.stringify(currEndpoints));
}

function getFromStore() {
  const endPoints = localStorage.getItem('httpceptor');
  return JSON.parse(endPoints);
}

function removeFromStore(endpoint) {
  const currEndpoints = getFromStore() || {};
  delete currEndpoints[endpoint];
  localStorage.setItem('httpceptor', JSON.stringify(currEndpoints));
}

function getDOMElement(elem) {
  return document.getElementById(elem);
}

function createRulesList(rulesObj) {

  let listStr = '';

  Object.keys(rulesObj || {}).forEach(path => {
    const methodObj = rulesObj[path];

    Object.keys(methodObj).forEach(method => {
      // const ruleObj = methodObj[method];
      listStr += `<li class="collection-item" id="${path}:${method}">${method} ${path}</li>`
    });
  });

  getDOMElement('rule-list-panel').children[0].innerHTML = listStr;
  getDOMElement('rule-list-panel').style.display = 'block';
  getDOMElement('rule-edit-panel').style.display = 'none';
}

function handleCreateRule() {

  getDOMElement('rule_method').value = 'GET';
  getDOMElement('rule_path').value = '/';
  getDOMElement('rule_code').value = 200;
  getDOMElement('rule_delay').value = 0;
  getDOMElement('rule_body').value = 'PONG';

  getDOMElement('rule-list-panel').style.display = 'none';
  getDOMElement('rule-edit-panel').style.display = 'block';
}

function toggleRulePanel() {
  getDOMElement('rule-list-panel').style.display = 'block';
  getDOMElement('rule-edit-panel').style.display = 'none';
}


function handleEditRule(event) {
  console.log(event);
  getDOMElement('rule-list-panel').style.display = 'none';
  getDOMElement('rule-edit-panel').style.display = 'block';
  const [path, method] = event.target.id.split(':');

  let obj = appState.rules[path][method];

  getDOMElement('rule_body').nextElementSibling.className = 'active';
  getDOMElement('rule_path').nextElementSibling.className = 'active';
  getDOMElement('rule_code').nextElementSibling.className = 'active';
  getDOMElement('rule_delay').nextElementSibling.className = 'active';

  getDOMElement('rule_method').value = method;
  getDOMElement('rule_path').value = path;
  getDOMElement('rule_code').value = obj.code || 200;
  getDOMElement('rule_delay').value = obj.delay || 0;
  getDOMElement('rule_body').value = obj.response || 'PONG';

}