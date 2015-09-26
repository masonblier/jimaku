function EditWordView(word){
  this.word = word;
}

EditWordView.prototype.render = function(){
  var $dialog = $('<div class="edit-word-dialog">'+
      '<h1>Add / Edit Word</h1>'+
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
        '<div class="form-group">'+
          '<label for="word-class">Class / Type</label>'+
          '<select id="word-class">'+
            '<option value=""></option>'+
            '<option value="word">Word</option>'+
            '<option value="slang">Slang</option>'+
            '<option value="Name">Name</option>'+
          '</select>'+
        '</div>'+
        '<div class="form-group">'+
          '<label for="word-dictionary">Context</label>'+
          '<select id="word-dictionary">'+
            '<option value="only-script">Only this Script</option>'+
            '<option value="only-series">Only this Series</option>'+
            '<option value="dictionary">Global Dictionary</option>'+
          '</select>'+
        '</div>'+
        '<div class="form-group">'+
          '<label for="word-replace-all">'+
            '<input type="checkbox" id="word-replace-all">'+
          'Replace all</label>'+
          '<button id="edit-word-submit">Save</button>'+
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
      meanings: (this.word ? this.word.meanings : null),
      'class': $dialog.find("#word-class").val()||null,
    };

    if (!word.text || !word.meaning) {
      $dialog.find(".form-error").show();
      return;
    }

    var targetDictionary = $dialog.find("#word-dictionary").val()||null;
    var replaceAll = !!$dialog.find("#word-replace-all").prop("checked");

    if (word.reading===word.text) {
      word.reading = null;
    }

    if (word.meanings) {
      var exists = false;
      word.meanings.forEach(function(wm){
        if (wm === word.meaning) exists = true;
      });
      if (!exists) {
        word.meanings.splice(0, 0, word.meaning);
      }
    }

    if (this.onResult) this.onResult(word, {replaceAll:replaceAll, dictionary:targetDictionary});

    editWordModal.hide();
  }.bind(this));

  if (this.word) {
    $dialog.find("#word-text").val(this.word.text);
    $dialog.find("#word-reading").val(this.word.reading);
    $dialog.find("#word-original").val(this.word.original);
    $dialog.find("#word-meaning").val(this.word.meaning);
    $dialog.find("#word-class").val(this.word['class']);
  }
  editWordModal.show();
};
