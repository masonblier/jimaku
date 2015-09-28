function ScriptVocabularyView(scriptName){
  this.scriptName = scriptName;
}

ScriptVocabularyView.prototype.render = function($el) {
  var $view = $('<div class="script-view"></div>');
  $el.append($view);

  var $spinner = $('<div style="text-align:center;margin-top:30px;">'+
      '<div class="loading-spinner"></div>'+
    '</div>');
  $view.append($spinner);

  this.script = new Script(this.scriptName);
  this.script.load(function(){
    $spinner.remove();

    $view.append('<div class="script-tabs">'+
        '<a href="/scripts/'+this.scriptName+'">Script</a>'+
        '<a href="/scripts/'+this.scriptName+'/vocabulary">Vocabulary</a>'+
      '</div>');
    $view.append('<h1>'+this.script.getDisplayName()+' Vocabulary</h1>');

    this.renderVocabularyList($view);
  }.bind(this));
};

ScriptVocabularyView.prototype.renderVocabularyList = function($el) {
  var $vocabTable = $('<table><thead>'+
      '<tr><th>Text</th><th>Reading</th><th>Meanings</th></tr>'+
    '</thead><tbody></tbody></table>');
  $el.append($vocabTable);
  var $vocabTableBody = $vocabTable.find("tbody");

  var vocabWords = {};
  this.script.lines.forEach(function(line){
    line.words.forEach(function(word){
      var wordText = word.root || word.text;
      if (!vocabWords[wordText]) {
        if (word.reading && word.meaning &&
            !/^[a-zA-Z0-9]+$/gm.test(wordText)) {
          vocabWords[wordText] = word;
        }
      }
    });
  });

  Object.keys(vocabWords).forEach(function(wordText){
    var word = vocabWords[wordText];
    $vocabTableBody.append('<tr>'+
        '<td>'+wordText+'</td>'+
        '<td>'+(word.reading||"")+'</td>'+
        '<td width="70%">'+(word.meanings||[]).join(', ')+'</td>'+
      '</tr>')
  });
};
