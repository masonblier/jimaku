var parser = require('../lib/parser.js');
var util = require('util');

var tests = [];

// tests
// test("友達と映画を見に行く");
// test("この車を修理するのに時間はどれくらいかかりますか");
test("この例文には字幕いっぱいです");
test("先輩と駄菓子屋に");
test("にゃんぱすー");
test("鍵　なんの");

runTests();

// misc functions
function wfo(obj){
  console.log(util.inspect(obj, {depth:null,colors:true}));
}
function wfr(results){
  console.log('\x1b[36m'+results.map(function(result){
    return (result ? result.map(function(choice){
      return choice.root;
    }).join(', ') : "");
  }).join('\n')+'\x1b[0m');
}
function log(){
  console.log('\x1b[93m'+Array.prototype.join.call(arguments, ' ')+'\x1b[0m');
}
function test(input){
  tests.push(function(){
    log();
    log(input);
    parser.parse(input).catch(function(err){
      console.error(err);
    }).done(function(result){
      wfo(result);
      runTests();
    });
  });
}
function runTests(){
  if (tests.length > 0) {
    tests.shift()();
  }
}
