var fs = require('fs');
var path = require('path');
var util = require('util');
var Promise = require('bluebird');
var kana = require('./kana');

var dict = module.exports = {};

var DICT_PATH = path.join(__dirname, '../data/dict.json');

var tables = {
  wordTable: {},
  kanjiTable: {},
  readingTable: {}
};

// load dictionary
dict.load = Promise.delay(100).then(function(){
  var st = Date.now();

  var raw = fs.readFileSync(DICT_PATH, {encoding:"utf8"});
  tables = JSON.parse(raw);

  var rt = Date.now()-st;
  console.log("\x1b[90m"+"dictionary loaded in "+(rt/1000.0)+"s"+"\x1b[0m")
}, 100);


// find
dict.find = function(root, reading){
  if (root && reading) {
    if (tables.wordTable[root+"::"+reading]) {
      return tables.wordTable[root+"::"+reading];
    }
  }
  if (root) {
    if (tables.wordTable[root]) {
      return tables.wordTable[root];
    }
    if (tables.kanjiTable[root]) {
      return tables.kanjiTable[root].map(function(wordkey){
        return tables.wordTable[wordkey];
      });
    }
  }
  if (reading) {
    if (tables.readingTable[reading]) {
      return tables.readingTable[reading].map(function(wordkey){
        return tables.wordTable[wordkey];
      });
    }
  }
  return [];
};

// find using mecab data
dict.findByMeCabData = function(data){
  return dict.load.then(function(){

    // console.log("-- finding --")
    // console.log(data)
    // console.log("--")

    if (data.lexical == '記号' ) { // symbol
      return [];
    }

    var text = data.original || data.text;
    var wordList = dict.find(text, data.reading);
    if (!wordList) {
      console.log("no words!", data)
      wordList = [];
    }

    return wordList;
  });
};
