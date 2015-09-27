var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var express = require('express');
var parser = require('../lib/parser');

Promise.promisifyAll(fs);

var scripts = module.exports = express.Router();

var SCRIPTS_PATH = path.join(__dirname, '../data/scripts');
var DATA_CACHE_PATH = path.join(__dirname, '../data/scripts_data');

scripts.get('/scripts/:scriptName', function (req, res) {

  var scriptName = req.params['scriptName'].replace(/[^a-zA-Z0-9-_ ]/gm,"");

  var scriptCachePath = path.join(DATA_CACHE_PATH, scriptName+'.json');
  if (fs.existsSync(scriptCachePath)) {
    fs.readFileAsync(scriptCachePath, {encoding:"utf8"}).done(function(scriptCacheRaw){
      var scriptData = JSON.parse(scriptCacheRaw);
      res.json(scriptData);
    });
    return;
  }

  var scriptPath = path.join(SCRIPTS_PATH, scriptName+'.txt');
  var raw = fs.readFileSync(scriptPath, {encoding:"utf8"});

  var script = {
    title: scriptName,
    lines: []
  };

  var linesData = raw.split(/\r?\n/).filter(function(rawline){
    return (rawline.trim().length > 0);
  }).map(function(rawline){
    var timestamp = rawline.split(' ', 1)[0];
    return {
      timestamp: timestamp,
      text: rawline.substr(timestamp.length+1)
    };
  });

  Promise.try(function(){
    return Promise.map(linesData, function(lineData, idx){
      console.log('parsing:',lineData.text)
      return parser.parse(lineData.text).then(function(words){
        lineData.words = words;
        return lineData;
      });
    }, {concurrency:1}).then(function(lines){
      script.lines = lines;
    });
  }).then(function(){
    if (!fs.existsSync(path.join(DATA_CACHE_PATH))) {
      fs.mkdirSync(path.join(DATA_CACHE_PATH));
    }
    return fs.writeFileAsync(scriptCachePath, JSON.stringify(script), {encoding:"utf8"});
  }).done(function(){
    res.json(script);
  });
});

scripts.get('/scripts', function(req, res){
  fs.readdirAsync(SCRIPTS_PATH).done(function(scriptList){
    res.json({list: scriptList.map(function(filename){
      return filename.substr(0, filename.lastIndexOf('.'));
    })});
  });
});
