function Script(name) {
  this.name = name;
}

Script.dataKeys = ['title', 'lines'];

Script.prototype.load = function(success, fail){
  $.get('/api/scripts/'+this.name).then(function(script){
    Script.dataKeys.forEach(function(key){
      this[key] = script[key];
    }.bind(this));

    this.wordList = new WordList(this.name);
    if (success) success();
  }.bind(this));
};

Script.prototype.saveDraft = function(){

};
