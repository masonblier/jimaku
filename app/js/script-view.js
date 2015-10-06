function ScriptView(scriptName){
  this.scriptName = scriptName;
}

ScriptView.prototype.render = function($el){
  var $scriptView = $('<div class="script-view"></div>');
  $el.append($scriptView);

  var $spinner = $('<div style="text-align:center;margin-top:30px;">'+
      '<div class="loading-spinner"></div>'+
    '</div>');
  $scriptView.append($spinner);

  this.$wordOverlays = $('<div class="script-word-overlays"></div>');
  $scriptView.append(this.$wordOverlays);

  this.$measureNode = $('<div class="script-measure-node"></div>');
  $scriptView.append(this.$measureNode);

  this.script = new Script(this.scriptName);
  this.script.load(function(){
    this.renderScript($scriptView, function(){
      $spinner.remove();
    });
  }.bind(this));
};

ScriptView.prototype.renderScript = function($el, cb){
  var _this = this;

  $el.css({height:'0',overflow:'hidden'});

  $el.append('<div class="script-tabs">'+
      '<a href="/scripts/'+this.scriptName+'">Script</a>'+
      '<a href="/scripts/'+this.scriptName+'/vocabulary">Vocabulary</a>'+
    '</div>');
  $el.append('<h1>'+_this.script.getDisplayName()+'</h1>');


  var $scriptLines = $('<div class="script-lines"><div>');
  $el.append($scriptLines);

  $el.on('mouseup', '.script-line', function(e){
    var $line = $(e.currentTarget);
    var line = _this.script.lines[parseInt($line.data("idx"), 10)];
    setTimeout(function(){
      this.handleSelection($line, line, window.getSelection());
    }.bind(this),0);
  }.bind(this));

  var lineIdx = 0;
  _this.$lines = [];
  renderNextLine();

  function renderNextLine() {
    // console.log('rendering line '+lineIdx)
    var line = _this.script.lines[lineIdx];

    var $line = _this.$lines[lineIdx] = $(
      '<div class="script-line" data-idx="'+lineIdx+'"></div>');
    $scriptLines.append($line);

    $line.on('click', function(e){
      _this.setHighlightedLine($line);
      if (!_this.wordClicked) {
        _this.hideWordOverlays();
      }
      _this.wordClicked = false;
    });

    _this.renderLine($line, line);

    lineIdx += 1;
    if (lineIdx < _this.script.lines.length) {
      if (lineIdx===20) showLines(); //hack
      setTimeout(renderNextLine, 0);
    } else {
      showLines();
    }
  }
  function showLines() {
    $el.css({height:'initial'});
    cb();
  }
};

ScriptView.prototype.renderLine = function($line, line){
  $line.html('<div class="script-timestamp">'+line.timestamp+'</div>');

  var $words = $('<div class="script-words"></div>');
  $line.append($words);

  line.words.forEach(function(word){

    var $wordText = $('<div class="script-word-text">'+word.text+'</div>');

    var $word = $('<div class="script-word"></div>');
    $word.append($wordText);

    $word.on('click', function(e){
      this.showWordClickOverlay($word, word, $line, line);
      this.wordClicked = true;
    }.bind(this));


    $words.append($word);
  }.bind(this));
};

ScriptView.prototype.setHighlightedLine = function($line){
  if (this.$highlightedLine) {
    this.$highlightedLine.removeClass("highlighted");
  }
  this.$highlightedLine = $line;
  this.$highlightedLine.addClass("highlighted");
};

ScriptView.prototype.showWordClickOverlay = function($word, word, $line, line){
  var wordReading = (word.reading && (word.text!==word.reading) ?
                      word.reading : "");
  var wordMeaning = word.meaning || "";

  // overlay htmls
  var $wordOverlayReading = $(wordReading.length > 0 ?
    '<div class="script-word-reading">'+wordReading+'</div>' : '');
  var $wordOverlayInfo = $('<div class="script-word-info">'+
      (wordMeaning.length > 0 ? '<div class="script-word-meaning">'+wordMeaning+'</div>' : '')+
      '<div class="script-word-meaning-select"></div>'+
    '</div>');

  this.$wordOverlays.html('');
  this.$wordOverlays.append($wordOverlayReading);
  this.$wordOverlays.append($wordOverlayInfo);

  // word meanings dropdown
  var $wordMeaning = $wordOverlayInfo.find(".script-word-meaning");
  var $meaningSelect = null;
  $wordMeaning.on('click', function(){
    if (!$meaningSelect) {
      $wordOverlayInfo.addClass("expanded");
      $meaningSelect = $wordOverlayInfo.find(".script-word-meaning-select");
      $meaningSelect.html('');

      // meaning select options
      (word.meanings||[]).forEach(function(meaningOption){
        if (meaningOption === wordMeaning) return;
        var $meaningSelectOption = $('<div class="script-word-meaning-select-option">'+meaningOption+'</div>');
        $meaningSelectOption.on('click', function(){
          word.meaning = meaningOption;
          this.script.saveDraft();
          $wordMeaning.html(meaningOption);

          $wordOverlayInfo.removeClass("expanded");
          $meaningSelect.html('');
          $meaningSelect = null;
        }.bind(this));
        $meaningSelect.append($meaningSelectOption);
      }.bind(this));

      // edit word option
      var $meaningSelectOption = $('<div class="script-word-meaning-select-option">Edit Word</div>');
      $meaningSelectOption.on('click', function(){
        var editWordView = new EditWordView(word);
        editWordView.onResult = function(newWord, options){
          // TODO determine wordList changes?
          this.script.wordList.addWord(word, options.dictionary);
          for (var k in newWord) {
            word[k] = newWord[k];
          }
          this.renderLine($line, line);
          if (options.replaceAll) {
            this.replaceAllWords(newWord);
          }
          this.script.saveDraft();
        }.bind(this);
        editWordView.render();

        this.hideWordOverlays();
      }.bind(this));
      $meaningSelect.append($meaningSelectOption);

    } else {
      $wordInfo.removeClass("expanded");
      $meaningSelect.html('');
      $meaningSelect = null;
    }
  }.bind(this));

  // positioning measurements
  var centerX = ($word.position().left + $word.width()/2);
  var left = (centerX - 60);
  var top = ($word.position().top - 28);
  var width = 120;

  $wordOverlayReading.css({
    left: left+'px',
    top: top+'px',
    width: width+'px',
    display: 'block'
  });
  $wordOverlayInfo.css({
    left: left+'px',
    top: (top+52)+'px',
    width: width+'px',
    display: 'block'
  });

  this.sel = null;
};

ScriptView.prototype.handleSelection = function($line, line, sel){
  var $anchorNode = $(sel.anchorNode);
  var $focusNode = $(sel.focusNode);
  if (sel.toString().length > 0 &&
      $anchorNode.parents(".script-words").length===1 &&
      $focusNode.parents(".script-words").length===1 &&
      $anchorNode.parents(".script-line").is($line) &&
      $focusNode.parents(".script-line").is($line)) {

    window.sel = sel;
    var selText = sel.toString().replace(/\n|\r/gm,'');
    // console.log('>'+selText);

    var anchorOffset = sel.anchorOffset;
    var focusOffset = sel.focusOffset;

    // detect anchor/focus node parents
    var $anchorNodeParent = ($anchorNode.hasClass('script-word-text') ?
      $anchorNode : $anchorNode.parents('.script-word-text'));
    var $focusNodeParent = ($focusNode.hasClass('script-word-text') ?
      $focusNode : $focusNode.parents('.script-word-text'));

    // swap if backwards selection
    if ($anchorNodeParent[0].getBoundingClientRect().left >
        $focusNodeParent[0].getBoundingClientRect().left) {
      var $tmp = $focusNode;
      var $tmpParent = $focusNodeParent;
      var tmpOffset = focusOffset;
      $focusNode = $anchorNode;
      $focusNodeParent = $anchorNodeParent;
      focusOffset = anchorOffset;
      $anchorNode = $tmp;
      $anchorNodeParent = $tmpParent;
      anchorOffset = tmpOffset;
    }

    // measure selection boundaries
    var anchorPreText = $anchorNode.text().substr(0, anchorOffset);
    var focusPreText = $focusNode.text().substr(0, focusOffset);
    var anchorOffsetLeft = this.getTextWidth(anchorPreText, 'script-word-text');
    var focusOffsetLeft = this.getTextWidth(focusPreText, 'script-word-text');
    var startLeft = $anchorNodeParent.position().left + anchorOffsetLeft;
    var endLeft = $focusNodeParent.position().left + focusOffsetLeft;
    var startTop = $anchorNodeParent.position().top;

    // calculate position in line
    var prelen = 0, pos = 0;
    $line.find(".script-word-text").each(function(){
      if ($(this).is($anchorNodeParent)) {
        pos = prelen + anchorOffset;
      } else {
        prelen += $(this).text().length;
      }
    });

    // show word overlay menu
    this.sel = {
      text: selText,
      line: line,
      $line, $line,
      pos: pos
    };

    var $wordOverlaySelect = $(
      '<div class="script-word-select">'+
        '<div class="script-word-select-btn"><div class="dropdown-arrow arrow-down"></div></div>'+
        '<div class="script-word-select-word">'+this.sel.text+'</div>'+
      '</div>');
    $wordOverlaySelect.click(this.clickWordSelect.bind(this));

    this.$wordOverlays.html('');
    this.$wordOverlays.append($wordOverlaySelect);

    var centerX = (startLeft + (endLeft - startLeft + 12)/2);
    $wordOverlaySelect.css({
      left: (centerX - 60)+'px',
      top: (startTop + 24)+'px',
      width: 120+'px',
      display: 'block'
    });

  } else {
    if (this.sel) {
      this.hideWordOverlays();
      this.sel = null;
    }
  }
};

ScriptView.prototype.hideWordOverlays = function(){
  this.$wordOverlays.html('');
  this.$wordSelectList = null;
};

ScriptView.prototype.clickWordSelect = function(e){
  $(e.currentTarget).find('.dropdown-arrow').toggleClass('arrow-up').toggleClass('arrow-down');
  if (this.$wordSelectList) {
    this.$wordSelectList.remove();
    this.$wordSelectList = null;
  } else {
    this.$wordSelectList = $('<div class="script-word-select-list"></div>');
    var $wordSelectListChoices = $('<div class="script-word-select-list-choices"></div>');
    this.$wordSelectList.append($wordSelectListChoices);

    $wordSelectListChoices.html('<div class="script-word-select-list-loading">'+
          '<div class="loading-spinner"></div>'+
        '</div>');
    this.script.wordList.query({text:this.sel.text}, function(choices){
      $wordSelectListChoices.html('');
      choices.forEach(function(choice){
        var $choice = $('<div class="script-word-select-list-choice">'+
            (choice.reading ? '<div class="script-word-select-list-choice-reading">'+choice.reading+'</div>' : '')+
            '<div class="script-word-select-list-choice-word">'+(choice.root||choice.text)+'</div>'+
            '<div class="script-word-select-list-choice-meaning">'+choice.meaning+'</div>'+
          '</div>');
        $choice.click(function(e){
          var word = choice;
          this.replaceWordInSelection(word);
          this.script.saveDraft();
          this.hideWordOverlays();
        }.bind(this));
        $wordSelectListChoices.append($choice);
      }.bind(this));
    }.bind(this));

    var $choiceAdd = $('<div class="script-word-select-list-choice">'+
        '<div class="script-word-select-list-choice-add">Add Word</div>'+
      '</div>');
    $choiceAdd.click(function(e){
      var editWordView = new EditWordView(this.sel);
      editWordView.onResult = function(word, options){
        this.script.wordList.addWord(word, options.dictionary);
        this.replaceWordInSelection(word);
        if (options.replaceAll) {
          this.replaceAllWords(word);
        }
        this.script.saveDraft();
      }.bind(this);

      editWordView.render();
      this.hideWordOverlays();
    }.bind(this));
    this.$wordSelectList.append($choiceAdd);

    var $wordOverlaySelect = this.$wordOverlays.find(".script-word-select");
    $wordOverlaySelect.append(this.$wordSelectList);
  }
  return false;
};

ScriptView.prototype.replaceWordInSelection = function(word){
  this.replaceWordInLine(word, this.sel.line, this.sel.pos, this.sel.text);
  this.renderLine(this.sel.$line, this.sel.line);
};

ScriptView.prototype.replaceWordInLine = function(word, line, pos, selText){
  var charIdx = 0;
  var firstWordIdx = -1, lastWordIdx = -1;
  var firstWordOffset = -1, lastWordOffset = -1;
  var currentWord;

  var text = selText || word.text;

  // find start/end words of selection
  for (var idx = 0; idx < line.words.length; ++idx) {
    currentWord = line.words[idx];
    if (firstWordIdx === -1) {
      if (currentWord.text.length + charIdx > pos) {
        firstWordIdx = idx;
        firstWordOffset = pos - charIdx;
      }
    }
    if (lastWordIdx === -1) {
      if ((currentWord.text.length + charIdx) > (pos + text.length)) {
        lastWordIdx = idx;
        lastWordOffset = (pos + text.length) - charIdx;
      }
    }
    charIdx += currentWord.text.length;
  }
  if (firstWordIdx === -1) {
    throw new Error("could not replace word ("+text+") in line ("+line.text+")")
  }
  // console.log("("+firstWordIdx+","+firstWordOffset+") ("+lastWordIdx+","+lastWordOffset+")");

  // replace line words
  var deleteCount = (lastWordIdx > -1 ?
                      (lastWordIdx == firstWordIdx ?
                        1 : (lastWordOffset > 0 ? 1 : 0)+(lastWordIdx-firstWordIdx)) :
                      line.words.length - firstWordIdx);
  var spliceArgs = [firstWordIdx, deleteCount];
  if (firstWordOffset > 0) {
    spliceArgs.push({
      text: line.words[firstWordIdx].text.slice(0, firstWordOffset)
    });
  }
  spliceArgs.push(word);
  if (lastWordOffset > 0) {
    spliceArgs.push({
      text: line.words[lastWordIdx].text.slice(lastWordOffset)
    });
  }
  Array.prototype.splice.apply(line.words, spliceArgs);

  line.text = line.words.map(function(word){return word.text;}).join("");
};

ScriptView.prototype.replaceAllWords = function(word){
  console.log('replacing all', word)
  for (var lineIdx = 0; lineIdx < this.script.lines.length; ++lineIdx) {
    var line = this.script.lines[lineIdx];
    if (line.text.indexOf(word.text) > -1) {
      var modified = false;
      var pos = 0;
      while (pos < line.text.length) {
        pos = line.text.substr(pos).indexOf(word.text);
        if (pos === -1) break;
        this.replaceWordInLine(word, line, pos);
        modified = true;
        pos += 1;
      }
      if (modified) {
        this.renderLine(this.$lines[lineIdx], line);
      }
    }
  }
};

ScriptView.prototype.getTextWidth = function(text, cssClass){
  this.$measureNode.addClass(cssClass);
  this.$measureNode.text(text);
  var width = this.$measureNode.width();
  this.$measureNode.removeClass(cssClass);
  return width;
};
