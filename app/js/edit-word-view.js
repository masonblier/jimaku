function EditWordView(word){
  this.word = word;
}

EditWordView.prototype.render = function(){
  var $dialog = $('<div class="edit-word-dialog">'+
      '<h1>Edit Word</h1>'+
      '<form>'+
        '<div class="form-error" style="display:none;">Word and Meaning are required.</div>'+
        '<div class="form-group">'+
          '<label for="word-text">Word</label>'+
          '<input type="text" id="word-text">'+
        '</div>'+
        '<div class="form-group">'+
          '<label for="word-reading">Reading</label>'+
          '<input type="text" id="word-reading">'+
        '</div>'+
        '<div class="form-group">'+
          '<label for="word-original">Root</label>'+
          '<input type="text" id="word-original">'+
        '</div>'+
        '<div class="form-group">'+
          '<label for="word-meaning">Meaning</label>'+
          '<input type="text" id="word-meaning">'+
        '</div>'+
        // '<div class="form-group">'+
        //   '<label for="word-pos">Part of Speech</label>'+
        //   '<select id="word-pos">'+
        //     '<option value=""></option>'+
        //     '<option value="noun">Noun</option>'+
        //     '<option value="verb-godan">Godan Verb</option>'+
        //     '<option value="verb-ichidan">Ichidan Verb</option>'+
        //     '<option value="adjective-i">い-adjective</option>'+
        //     '<option value="adjective-na">な-adjective</option>'+
        //     '<option value="adjective-no">の-adjective</option>'+
        //     '<option value="name">Name</option>'+
        //   '</select>'+
        // '</div>'+
        '<div class="form-group">'+
          '<label for="word-dictionary">Context</label>'+
          '<select id="word-dictionary">'+
            '<option value="only-script">Only this Script</option>'+
            '<option value="only-series">Only this Series</option>'+
            '<option value="dictionary">Global Dictionary</option>'+
          '</select>'+
        '</div>'+
        '<div class="form-group">'+
          // '<label for="word-replace-all">'+
          //   '<input type="checkbox" id="word-replace-all">'+
          // 'Replace all</label>'+
          '<button id="edit-word-submit">Edit Word</button>'+
        '</div>'+
      '</form>'+
    '</div>');

  var editWordModal = new Modal($dialog);

  $dialog.find("#edit-word-submit").click(function(e){
    e.preventDefault();

    var word = {
      text: $dialog.find("#word-text").val()||null,
      reading: $dialog.find("#word-reading").val()||null,
      original: $dialog.find("#word-original").val()||null,
      meaning: $dialog.find("#word-meaning").val()||null,
      // pos: $dialog.find("#word-pos").val()||null,
    };

    if (!word.text || !word.meaning) {
      $dialog.find(".form-error").show();
      return;
    }

    var targetDictionary = $dialog.find("#word-dictionary").val()||null;

    if (word.reading===word.text) {
      word.reading = null;
    }

    if (this.onEditWord) this.onEditWord(word);//, replaceAll, targetDictionary);

    editWordModal.hide();
  }.bind(this));

  if (this.word) {
    $dialog.find("#word-text").val(this.word.text);
    $dialog.find("#word-reading").val(this.word.reading);
    $dialog.find("#word-original").val(this.word.original);
    $dialog.find("#word-meaning").val(this.word.meaning);
  }
  editWordModal.show();
};
