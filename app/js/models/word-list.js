function WordList(name) {
  this.name = name;
  this.load();
}

WordList.prototype.lookupWord = function(text){
  return this.words[text] || null;
};

WordList.prototype.addWord = function(word){
  // console.log('adding word')
  if (!this.words[word.text]) {
    this.words[word.text] = [];
  }
  this.words[word.text].push(word);
  this.save();
};

WordList.prototype.query = function(word, success, fail){
  var results = this.words[word.text] || [];
  // console.log('queried word',word,results)
  $.post('/api/words', JSON.stringify({word:word})).then(function(alternatives){
    results = results.concat(alternatives);
    if (success) success(results);
  }).fail(fail);
};

WordList.prototype.load = function(){
  this.words = {};
  if (localStorage['wordlist-'+this.name]) {
    this.words = JSON.parse(localStorage['wordlist-'+this.name]);
  }
};

WordList.prototype.save = function(){
  localStorage['wordlist-'+this.name] = JSON.stringify(this.words);
};
