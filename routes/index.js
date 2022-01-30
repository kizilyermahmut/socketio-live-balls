var express = require('express');
var router = express.Router();
var envConf = require('../config/env.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Live Balls' });
});

router.get('/getEnv', function (req, res) {
  var env = envConf[process.env.NODE_ENV || 'development'];
  return res.json(env);
});

module.exports = router;
