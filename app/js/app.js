var App = window.App = {};

// jquery ajax
$.ajaxSetup({
  contentType: "application/json; charset=utf-8",
  dataType: "json",
  xhrFields: {
    withCredentials: true
  }
});

// app start
App.start = function(){
  App.router.watchHrefs();
  App.router.start();
};

// routes
App.router = new PushStateRouter();

App.router.on("/", function(){
  App.setCurrentView(new HomeView());
});

App.router.on("/tests", function(){
  App.setCurrentView(new TestsView());
});

App.router.on("/ev", function(){
  App.setCurrentView(new EvToolView());
});

// setCurrentView
App.setCurrentView = function(view){
  function _delayed(err){
    if (err) throw err;
    App.currentView = view;
    var $app = document.getElementById("app");
    $app.innerHTML = "";
    view.render($app);
  }
  if (App.currentView) {
    if (App.currentView.detach.length > 0) {
      return App.currentView.detach(_delayed);
    } else {
      App.currentView.detach();
      _delayed();
    }
  } else {
    _delayed();
  }
};
