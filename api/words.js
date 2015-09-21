var Promise = require('bluebird');
var express = require('express');
var dict = require('../lib/dictionary');

var words = module.exports = express.Router();

words.post('/words', function (req, res) {

  var word = req.body.word;
  // console.log(word);

  dict.findByMeCabData(word).done(function(results){
    res.json(results.map(function(result){
      return {
        text: word.text,
        root: result.root,
        reading: result.reading,
        meaning: (result.meanings && result.meanings[0]),
      };
    }));
  });

});
