"use strict";

var Router = {}

Router._routes = [];
Router._routeChangeListeners = [];

Router.html5Mode = false;

Router.defineRoute = function (name, definition) {
  if(!definition.url || !definition.url.length)
    throw new TypeError('Route definition for "' + name + '" must include a url');

  Router._routes[name] = definition;
};

Router.getCurrentRoute = function () {
  return Router._currentRoute;
}

Router.findCurrentRoute = function () {
  if(Router.html5Mode === false) {
    var path = window.location.hash.slice(1)
  } else {
    var path = window.location.pathname;
  }

  for(var name in Router._routes) {
    var route = Router._routes[name];

    var urlPattern = '^' + route.url + '$'
    urlPattern = urlPattern.replace(/\//g, '\\\/')
    urlPattern = urlPattern.replace(/\:\w+\:/g, '(.*)')

    var matches = path.match(new RegExp(urlPattern))

    if (matches && matches.length) {
      return Object.assign(route, {params: Router._getRouteParams(path, route)});
    }
  }
};

Router.getRoute = function (name) {
  if(!(name in Router._routes)) {
    throw new ReferenceError('Route "' + name + '" not found');
  }

  return Router._routes[name];
}

Router.goToRoute = function (name) {
  var route = Router.getRoute(name);
};

Router.stopListening = function () {
  window.onhashchange = null;
}

Router.startListening = function () {
  Router._onLocationChange();
  window.onhashchange = Router._onLocationChange;

  if(Router.html5Mode === false && window.location.hash === "") {
    window.location.hash = "#/"
  }
}

Router.onRouteChange = function (func) {
  Router._routeChangeListeners.push(func)
}

Router._getRouteParams = function(url, route) {
  var urlPattern = route.url
  urlPattern = urlPattern.replace(/\//g, '\\\/')
  urlPattern = urlPattern.replace(/\:\w+\:/g, '(.*)')

  var paramNames = (new RegExp(/(?:\:)(\w+)(?:\:)/g)).exec(route.url)
  if (paramNames && paramNames.length) {
    paramNames.shift()
  }

  var parsedParams = {}

  var urlParams = url.match(new RegExp(urlPattern));
  if(urlParams && urlParams.length) {
    urlParams.shift()

    for (var i = 0; i < urlParams.length; i++) {
      parsedParams[paramNames[i]] = urlParams[i]
    }
  }

  return parsedParams;
}

Router._onLocationChange = function (argument) {
  var prevRoute = Router._currentRoute
  var nextRoute = Router.findCurrentRoute();

  if(nextRoute) {
    for (var i = 0; i < Router._routeChangeListeners.length; i++) {
      Router._routeChangeListeners[i](prevRoute, nextRoute)
    }
    Router._currentRoute = nextRoute;
  }
}

window.Router = Router;