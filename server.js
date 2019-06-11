const express = require('express');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server);

const path = require('path');
const debug = require('debug');
const bodyParser = require('body-parser');

const debugInfo = debug('info');

const config = require('./config.json');
const controller = require('./src/controller');
const sockets = require('./src/sockets/handler');

app.disable('x-powered-by');
app.disable('etag');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

controller.initialize('local');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/main/:endpoint', (req, res) => {
  controller.checkEndpoint(req, (err) => {
    // console.error(err);
    if(!err) {
      return res.sendFile(path.join(__dirname, 'public', '404.html'));
    }
    res.sendFile(path.join(__dirname, 'public', 'mock.html'));
  });
});

app.all('/mock/:endpoint?/*?', (req, res) => {

  // console.log(req.params);
  // res.send('over');

  if(!req.params.endpoint && !req.params['0']) {
    return res.status(404).send('Bad Input');
  }

  if(!req.params.endpoint && req.params['0']) {
    req.params.endpoint = req.params['0'];
    req.params['0'] = '';
  }

  if(req.params['0'] == undefined) {
    req.params['0'] = '';
  }

  controller.handleMock(req, (err, resp) => {
    if(err) {
      return res.status(err.code || 500).send(err.message || 'Internal error.');
    }
    res.status(resp.code).send(resp.response);
  })
});

app.post('/api/endpoint/create', (req, res) => {

  controller.handleCreateReq(req, (err) => {
    if(err) {
      return res.status(err.code || 500).send(err.message || 'Internal error.');
    }
    res.status(200).send({success: true});
  });
});

app.post('/api/rules/edit/:endpoint', (req, res) => {

  controller.handleEditRules(req, (err) => {
    if(err) {
      return res.status(err.code || 500).send(err.message || 'Internal error.');
    }
    res.status(200).send({success: true});
  });
});

app.get('/api/rules/:endpoint', (req, res) => {

  controller.handleGetRules(req, (err, resp) => {
    if(err) {
      return res.status(err.code || 500).send(err.message || 'Internal error.');
    }
    res.status(200).send({data: resp});
  });
});

app.all('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

io.on('connection', (socket) => {
  sockets.socketHandler(socket);
});

server.listen(config.server.port, () => {
  debugInfo('Server started at port', config.server.port);
});