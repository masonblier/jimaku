function EvToolView(){
  this.filekey = "";
  this.filename = "";
  this.scriptText = "";
  this.vocabText = "";
}

EvToolView.prototype.render = function($el){
  var $fileForm = document.createElement('div');
  $fileForm.className = "episode-file-form";

  $fileForm.innerHTML =
    '<label>Open script file:</label>';
  var $fileInput = document.createElement('input');
  $fileInput.setAttribute('type', 'file');
  $fileInput.addEventListener('change', function(e){
    var file = e.target.files[0];
    if (file) {
      this.filekey = file.name.replace(/[^a-zA-Z0-9-_.]/g, '');
      this.load();
      var reader = new FileReader();
      reader.onload = function(e){
        this.filename = file.name;
        this.scriptText = e.target.result;
        this.save();
        this.renderScriptView($scriptView);
      }.bind(this);
      reader.readAsText(file);
    }
  }.bind(this));
  $fileForm.appendChild($fileInput);

  var $openRecentView = document.createElement('div');
  $openRecentView.className = "open-recent-view";
  EvToolView.prototype.renderRecentsView($openRecentView);

  var $scriptView = document.createElement('div');
  $scriptView.className = 'ev-script-view';

  $el[0].innerHTML = '';
  $el[0].appendChild($fileForm);
  $el[0].appendChild($openRecentView);
  $el[0].appendChild($scriptView);
};

EvToolView.prototype.renderRecentsView = function($el){
  $el.innerHTML = 'Open Recent:';
  var makeRecentLink = function(filekey){
    var $link = document.createElement('a');
    $link.className = "recent-link";
    $link.setAttribute('href', '#');
    $link.innerHTML = localStorage["file-"+filekey];
    $link.addEventListener('click', function(e){
      e.preventDefault();
      this.filekey = filekey;
      this.load();
      this.renderScriptView(document.querySelector('.ev-script-view'));
    }.bind(this), false);
    return $link;
  }.bind(this);
  for (var k in localStorage) {
    if (/^file-/.test(k)) {
      $el.appendChild(makeRecentLink(k.substr(5)));
    }
  }
};

EvToolView.prototype.renderScriptView = function($el){
  $el.innerHTML =
    '<div class="episode-script">'+
      '<div class="episode-script-box">'+this.formatScript()+'</div>'+
    '</div>';

  var $vocabularyList = document.createElement('div');
  $vocabularyList.className = "vocabulary-list";
  var $vocabularyListBox = document.createElement('div');
  $vocabularyListBox.className = "vocabulary-list-box";
  $vocabularyListBox.setAttribute('contenteditable', true);
  $vocabularyListBox.innerHTML = this.vocabText.replace(/\r?\n/gm,'<br/>\n');
  $vocabularyList.appendChild($vocabularyListBox);
  $el.appendChild($vocabularyList);

  var saveChanges = function(e){
    this.vocabText = $vocabularyListBox.innerText;
    this.save();
  }.bind(this);
  $vocabularyListBox.addEventListener('keydown', function(e){
    e.stopPropagation();
  }, false);
  $vocabularyListBox.addEventListener('keyup', saveChanges);
  $vocabularyListBox.addEventListener('paste', saveChanges);

  document.addEventListener('scroll', function(e){
    $vocabularyList.style.marginTop =
      ''+Math.max(document.body.scrollTop-$vocabularyList.clientHeight+500-134, 0)+'px';
  });
};

EvToolView.prototype.formatScript = function(){
  return this.scriptText.replace(/\s*\{grid\/move\/down\}\s*/gm,' ').split('\n').map(function(l,i){
    var lnum = '<span class="linenum">'+
                 (i < 99 ? '0' : '')+(i < 9 ? '0' : '')+(1+i)+
               '</span>';
    return ""+lnum+" "+l;
  }).join('<br/>\n');
};
EvToolView.prototype.formatFilename = function(){
  return this.filename.replace(/(?:\.jp)?\.ass(?:\.txt)?$/,'').replace(/\s*\[.+?\]/gm,'').trim();
};

EvToolView.prototype.load = function(){
  this.filename = window.localStorage["file-"+this.filekey]||"";
  this.scriptText = window.localStorage["script-"+this.filekey]||"";
  this.vocabText = window.localStorage["vocabulary-"+this.filekey]||"";
};
EvToolView.prototype.save = function(){
  window.localStorage["file-"+this.filekey] = this.formatFilename()||"";
  window.localStorage["script-"+this.filekey] = this.scriptText||"";
  window.localStorage["vocabulary-"+this.filekey] = this.vocabText||"";
};
