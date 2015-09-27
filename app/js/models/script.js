function Script(name) {
  this.name = name;
}

Script.dataKeys = ['title', 'lines'];

Script.prototype.load = function(success, fail){
  this.words = {};

  var next = nextFn.bind(this);
  if (localStorage['script-draft-'+this.name]) {
    next(JSON.parse(localStorage['script-draft-'+this.name]));
  } else {
    $.get('/api/scripts/'+this.name).then(next);
  }

  function nextFn(script){
    Script.dataKeys.forEach(function(key){
      this[key] = script[key];
    }.bind(this));

    this.wordList = new WordList(this.name);
    if (success) success();
  }
};

Script.prototype.saveDraft = function(){
  var draft = {};
  Script.dataKeys.forEach(function(key){
    draft[key] = this[key];
  }.bind(this));
  localStorage['script-draft-'+this.name] = JSON.stringify(draft);
};

Script.prototype.getDisplayName = function(){
  return this.name.replace(/\-(\d+)/gm, function(a, m){
    return ' - '+m;
  }).replace(/_/gm, ' ');
};
