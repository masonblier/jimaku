function Modal($el){
  this.$el = $el;
}

Modal.prototype.show = function(){
  $("#modal").remove();

  var $modal = $('<div id="modal"><div id="modal-dialog"></div></div>');
  $(document.body).append($modal);

  $modal.click(function(){
    this.hide();
  }.bind(this))
  $modal.find("#modal-dialog").click(function(e){
    e.stopPropagation();
  }.bind(this))

  if (this.$el) {
    $modal.find("#modal-dialog").append(this.$el);
  }
};

Modal.prototype.hide = function(){
  $("#modal").remove();
};
