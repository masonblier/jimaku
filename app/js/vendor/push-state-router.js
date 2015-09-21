/*
 The MIT License (MIT)

 Copyright (c) 2013

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
  router with simple param-replacement
**/
function Router(options) {
  this._prefix = (options && options.prefix) || "";
  this._routeTree = {};
}
Router.prototype.constructor = Router;

/**
  handles routing using html5 push-state
**/
function PushStateRouter(options) {
  Router.call(this, options);
}

PushStateRouter.prototype = Object.create(Router.prototype);
PushStateRouter.prototype.constructor = PushStateRouter;

Router.prototype.on = function(route, listener) {
  // clean route and get parts
  if (!listener && (typeof route == 'function')) { listener = route; route = "/"; }
  route = "/"+route.replace(/\/+$/,"").replace(/^\/+/,""); // trip trailing slash but ensure leading slash
  var parts = route.replace(this._prefix,"").split("/").slice(1); // split, slicing the first since we ensured a leading slash

  // follows a path down the route tree, creating nodes which do not yet exist
  var node = this._routeTree;
  for (var i = 0; i < parts.length; ++i) {
    var part = parts[i];
    if (part.length <= 0) { // no route or blank route
      continue;
    } else if (part.charAt(0)==':') { // param matcher
      var paramName = part.substr(1);
      if (/^[a-zA-Z0-9_]+$/.test(paramName)) {
        if (!node[":"]) { node[":"] = {}; }
        if (!node[":"][paramName]) { node[":"][paramName] = {}; }
        node = node[":"][paramName];
        continue;
      } else {
        throw new Error("invalid param matcher "+part);
      }
    } else { // normal route match
      if (/^[a-zA-Z0-9_]+$/.test(part)) {
        if (!node[part]) { node[part] = {}; }
        node = node[part];
        continue;
      } else {
        throw new Error("invalid route part "+part);
      }
    }
  }

  // place our listener on the / node of the deepest matched route
  if (!node["/"]) { node["/"] = []; }
  node["/"].push(listener);
  return this;
};

Router.prototype.handle = function(route) {
  // ignore duplicate requests (eg: chrome calling onpopstate immediately upon you listening to it)
  if (this._currentRoute === route) {
    return false;
  }
  this._currentRoute = route;

  // save any args beyond the first one
  var args = Array.prototype.slice.call(arguments,1);

  // param variables matched
  var params = {};

  // clean route and get parts
  route = "/"+route.replace(/\/+$/,"").replace(/^\/+/,""); // trip trailing slash but ensure leading slash
  var parts = route.replace(this._prefix,"").split("/").slice(1); // split, slicing the first off since we ensured a leading slash

  // follows a path down the route tree, matching the first applicable path
  var node = this._routeTree;
  for (var i = 0; i < parts.length; ++i) {
    var part = parts[i];
    if (part.length <= 0) { // no route or blank route
      continue;
    } else if (node[part]) { // normal route match
      node = node[part];
      continue;
    } else if (node[":"]) { // if there are param matchers
      var firstNode = null;
      for (var key in node[":"]) {
        if ({}.hasOwnProperty.call(node[":"],key)){
          if (firstNode==null) { firstNode = node[":"][key]; }
          params[key] = part; // attach value to param hash
        }
      }
      if (firstNode) {
        node = firstNode;
        continue;
      } else {
        throw new Error("param matcher fake out?!")
      }
    } else {
      return this._error(404);
    }
  }

  // call any listeners on "/", if there is no slash then route error?
  if (node["/"]) {
    node["/"].forEach(function(listener){
      // todo: probably shouldn't indiscriminantly try to attach properties to the first param
      if (!args[0]) { args[0] = {}; }
      args[0].route = route;
      args[0].params = params;
      // call handle if the listener has it (such as a Router instance)
      if (listener.handle) {
        listener.handle.apply(this,args);
      } else {
        listener.apply(this, args);
      }
    });
  } else {
    console.info(this)
    return this._error(404);
  }

  return;
};

Router.prototype._error = function(err) {
  if (this.onerror) return this.onerror(err);
  throw new Error("PushStateRouter error: "+err);
};

PushStateRouter.prototype.start = function() {
  var _this = this;
  this.handle(document.location.pathname);
  window.onpopstate = function(event) {
    _this.handle(document.location.pathname);
  };
  return this;
};

PushStateRouter.prototype.navigate = function(path) {
  window.history.pushState(null,null,path);
  var args = Array.prototype.slice.call(arguments, 1);
  args.unshift(document.location.pathname);
  this.handle.apply(this, args);
};

PushStateRouter.prototype.watchHrefs = function() {
  var _this = this;
  $(document).on("click", "a:not([data-bypass])", function(evt) {
    var href = $(this).attr("href");
    var protocol = this.protocol + "//";
    if (href && href.slice(0, protocol.length) !== protocol &&
        href.indexOf("javascript:") !== 0) {
      evt.preventDefault();
      _this.navigate(href);
    }
  });
};
