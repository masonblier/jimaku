function HomeView(){
}

HomeView.prototype.render = function($el){
  this.$homeView = $('<div class="home-view"></div>');

  var scriptName = 'Non Non Biyori - 01';
  this.scriptView = new ScriptView(scriptName)
  this.scriptView.render(this.$homeView);

  $el.appendChild(this.$homeView[0]);
};
