const config = require('config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const Memcached = require('memcached');

const SERVER_PORT = process.env.SERVER_PORT || config.server.port || 8080;

const memcached = new Memcached('10.85.15.101:11211');
memcached.on('failure', function( details ) {
  console.log('cannot connect to memcached', details);
});

const app = express();
app.use(helmet({}));
app.use(cors({}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({strict: false}));

app.get('/', (req, res) => {
  res.status(200).json({env: config.env, time: Date.now()});
});

app.get('/live', (req, res) => {
  res.status(200).json({ok: 1});
});

app.get('/cache/get', (req, res) => {
  memcached.get('foobar', function(err, data) {
    res.status(200).json({cacheData: data});
  });
});

app.get('/cache/set', (req, res) => {
  memcached.set('foobar', req.query.foobar, 10, function(err) {
    res.status(200).json({ok: 1});
  });
});

app.listen(SERVER_PORT, () => {
  console.log('HOLOTOOLS WEB | :%d | %s | %s', SERVER_PORT, config.env, new Date().toString());
});


