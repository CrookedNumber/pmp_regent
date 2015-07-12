(function() {
  var app = angular.module('PMPViewer', ['ngRoute']);

  app.config(function($routeProvider) {
    $routeProvider
      .when("/", {
        templateUrl: 'docsTable.html',
        controller: 'DocsTableController',    
      })
      .when("/doc/:guid", {
        templateUrl: 'view.html',
        controller: 'PMPShowController',    
      })
      .when("/edit/:guid", {
        templateUrl: 'edit.html',
        controller: 'PMPEditController',    
      })
      .when("/login", {
        templateUrl: 'login.html',
        controller: 'PMPLoginController',    
      });
  });
  
}());
