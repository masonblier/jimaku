var fs = require('fs');
var path = require('path');
var util = require('util');
var Promise = require('bluebird');
var kana = require('./kana');

var dict = module.exports = {};

var DICT_PATH = path.join(__dirname, '../data/dict.dat.txt');

// load dictionary
dict.load = Promise.delay(100).then(function(){
  dict.wordTable = {};
  dict.readingTable = {};

  var st = Date.now();

  var matcher = /^([^\[]+) (?:\[([^\]]+)\] )?\/\(([^\)]+)\) (.+)$/;
  var raw = fs.readFileSync(DICT_PATH, {encoding:"utf8"});

  var lines = raw.split(/\r?\n/);
  lines.forEach(function(line, idx){
    if (line.length===0) return;

    var m = matcher.exec(line);
    if (m) {
      var commonWord = false;
      var meanings = m[4].split('/').filter(function(m){
        if (m==="(P)") {
          commonWord = true;
          return false;
        }
        return m.length>0;
      });
      var word = {
        root: m[1],
        reading: m[2],
        tags: m[3].split(','),
        meanings: meanings,
        common: commonWord
      };

      if (!dict.wordTable[word.root]) {
        dict.wordTable[word.root] = [];
      }

      dict.wordTable[word.root].push(word);

      var reading = kana.htok(word.reading||word.root);

      if (!dict.readingTable[reading]) {
        dict.readingTable[reading] = [];
      }

      if (word.tags.indexOf('uk')>=0) {
        dict.readingTable[reading].unshift(word);
      } else {
        dict.readingTable[reading].push(word);
      }

    } else {
      console.error('(dictionary) unmatched line ('+idx+'): '+line);
    }
  });

  var rt = Date.now()-st;
  console.log("\x1b[90m"+"dictionary loaded in "+(rt/1000.0)+"s"+"\x1b[0m")
}, 100);


// find
dict.findByMeCabData = function(data){
  return dict.load.then(function(){
    var wordList = null;
    var text = data.original || data.text;

    // console.log("-- finding --")
    // console.log(data)
    // console.log("--")

    if (data.lexical == '記号' ) { // symbol
      return [];
    }

    if (dict.wordTable[text]) {
      wordList = dict.wordTable[text];
    }

    if (!wordList && kana.isHiragana(text)) {
      var originalReading = kana.htok(text);
      if (dict.readingTable[originalReading]) {
        wordList = dict.readingTable[originalReading];
      }
    }

    if (!wordList && data.reading) {
      if (dict.readingTable[data.reading]) {
        wordList = dict.readingTable[data.reading];
      }
    }

    if (!wordList) {
      console.log("no words!", data)
      wordList = [];
    }

    if (wordList.length > 1) {
      if (kana.isHiragana(text)) {
        wordList = wordList.filter(function(word){
          return (!word.reading || word.reading===text);
        });
      } else if (data.reading) {
        wordList = wordList.filter(function(word){
          return (!word.reading || kana.htok(word.reading)===data.reading);
        });
      }
      // todo filter POS?
    }
    // console.log(wordList)
    // console.log("--")

    return wordList;
  });
};
