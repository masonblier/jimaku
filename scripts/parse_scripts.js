var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var parser = require('../lib/parser');

Promise.promisifyAll(fs);

var SCRIPTS_PATH = path.join(__dirname, '../data/scripts');
var DATA_CACHE_PATH = path.join(__dirname, '../data/scripts_data');

fs.readdirAsync(SCRIPTS_PATH).then(function(scriptList){

  return Promise.map(scriptList, function(filename){

    var scriptName = filename.substr(0, filename.lastIndexOf('.'));

    var scriptPath = path.join(SCRIPTS_PATH, scriptName+'.txt');
    var raw = fs.readFileSync(scriptPath, {encoding:"utf8"});

    var scriptCachePath = path.join(DATA_CACHE_PATH, scriptName+'.json');
    if (fs.existsSync(scriptCachePath)) {
      return;
    }

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

    return Promise.try(function(){
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
    }).then(function(){
      return;
    });

  }, {concurrency:1});
}).then(function(){
  console.log("Script completed.");
});
