var fs = require('fs');
var path = require('path');
var kana = require('../lib/kana');

var SOURCE_PATH = path.join(__dirname, '../data/dict.dat.txt');
var DEST_PATH = path.join(__dirname, '../data/dict.json');

// dict tables
var dict = {
  wordTable: {},
  kanjiTable: {},
  readingTable: {}
};

(function(){
  var st = Date.now();

  var matcher = /^([^\[]+) (?:\[([^\]]+)\] )?\/\(([^\)]+)\) (.+)$/;
  var raw = fs.readFileSync(SOURCE_PATH, {encoding:"utf8"});

  var lines = raw.split(/\r?\n/);
  lines.forEach(function(line, idx){
    if (line.length===0) return;

    var m = matcher.exec(line);
    if (m) {

      // parse match
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
        tags: m[3].split(',') || [],
        meanings: meanings || [],
        common: commonWord
      };

      // get unique word key
      var wordkey;
      if (kana.isKana(word.root)) {
        wordkey = word.root;
      } else if (word.reading) {
        wordkey = word.root+"::"+word.reading;
      } else {
        wordkey = word.root;
      }

      // merge into dict
      if (!dict.wordTable[wordkey]) {
        dict.wordTable[wordkey] = word;
      } else {
        mergeSet(dict.wordTable[wordkey].meanings, word.meanings);
        mergeSet(dict.wordTable[wordkey].tags, word.tags);
      }

      // add to reading and kanji tables
      var reading = kana.htok(word.reading||word.root);
      if (!kana.isKana(word.root)) {
        if (!dict.kanjiTable[word.root]) {
          dict.kanjiTable[word.root] = [];
        }
        if (word.common) {
          dict.kanjiTable[word.root].unshift(wordkey);
        } else {
          dict.kanjiTable[word.root].push(wordkey);
        }
      }
      if (!dict.readingTable[reading]) {
        dict.readingTable[reading] = [];
      }
      if (word.tags.indexOf('uk')>=0) {
        dict.readingTable[reading].unshift(wordkey);
      } else {
        dict.readingTable[reading].push(wordkey);
      }

    } else {
      console.error('(dictionary) unmatched line ('+idx+'): '+line);
    }
  });

  var rt = Date.now()-st;
  console.log("\x1b[90m"+"dictionary loaded in "+(rt/1000.0)+"s"+"\x1b[0m")
})();

(function(){
  var st = Date.now();

  fs.writeFileSync(DEST_PATH, JSON.stringify(dict), {encoding:"utf8"});

  var rt = Date.now()-st;
  console.log("\x1b[90m"+"dictionary written in "+(rt/1000.0)+"s"+"\x1b[0m")
})();

function mergeSet(dest, src){
  src.forEach(function(sw){
    if (dest.indexOf(sw) === -1) {
      dest.push(sw);
    }
  });
}
