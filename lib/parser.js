var Promise = require('bluebird');
var MeCab = require('mecab-async');
var dict = require('./dictionary');

var mecab = Promise.promisifyAll(new MeCab());

var parser = module.exports = {};

parser.parse = function(line) {
  return Promise.try(function(){
    return mecab.parseAsync(line);
  }).then(_formatMecabResult).then(function(results){

    var reconstructedLine = results.map(function(r){return r.kanji;}).join("");
    if (reconstructedLine!==line) {
      throw new Error("line/parser mismatch\n  "+line+"\n  "+reconstructedLine);
    }

    return Promise.map(results, function(data){
      return dict.findByMeCabData(data).then(function(alternatives){
        var matched = alternatives[0]||{};
        if (data.lexical!=='助詞' &&
            ['の','は','ん'].indexOf(data.kanji)===-1) {
          var matchedMeaning = (matched.meanings && matched.meanings[0]);
        }
        return {
          text: data.kanji,
          root: matched.root,
          reading: matched.reading,
          meaning: matchedMeaning,
          meanings: matched.meanings,
          // morphology: data,
          // alternatives: alternatives
        };
      });
    }, {concurrency:1});
  });
};

// taken from mecab-async plugin
function _formatMecabResult(arrayResult){
    var result = [];
    if (!arrayResult) { return result; }
    // Reference: http://mecab.googlecode.com/svn/trunk/mecab/doc/index.html
    // 表層形\t品詞,品詞細分類1,品詞細分類2,品詞細分類3,活用形,活用型,原形,読み,発音
    arrayResult.forEach(function(parsed) {
        // if (parsed.length <= 8) { return; }
        result.push({
            kanji         : parsed[0],
            lexical       : parsed[1],
            compound      : parsed[2],
            compound2     : parsed[3],
            compound3     : parsed[4],
            conjugation   : parsed[5],
            inflection    : parsed[6],
            original      : parsed[7],
            reading       : parsed[8],
            pronunciation : parsed[9]// || ''
        });
    });
    return result;
}
