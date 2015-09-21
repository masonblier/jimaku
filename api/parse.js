var Promise = require('bluebird');
var express = require('express');
var parser = require('../lib/parser');

var parse = module.exports = express.Router();

parse.post('/parse', function (req, res) {

  var input = req.body.input;
  // console.log(input);

  parser.parse(input).done(function(result){
    res.json(result);
  });

});
