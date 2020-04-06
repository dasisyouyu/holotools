const config = require('config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const Memcached = require('memcached');

const GOOGLE_AUTH = JSON.parse(process.env.GOOGLE_SERVICE_JSON);
console.log(GOOGLE_AUTH.client_email, GOOGLE_AUTH.private_key);

const SERVER_PORT = process.env.SERVER_PORT || config.server.port || 8080;

const memcached = new Memcached('10.85.15.101:11211');
memcached.on('failure', function( details ) {
  console.log('Cannot connect to memcached', details);
});

const app = express();
app.use(helmet({}));
app.use(cors({}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({strict: false}));

app.get('/', (req, res) => {
  res.status(200).json({env: config.env, time: Date.now()});
});

const routes1 = require('./routes/v1');

app.use('/v1', routes1);

app.listen(SERVER_PORT, () => {
  console.log('HOLOTOOLS WEB | :%d | %s | %s', SERVER_PORT, config.env, new Date().toString());
});


