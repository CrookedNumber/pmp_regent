(function() {
  var app = angular.module('PMPViewer');
  
  function determineLogIn($scope) {
    var platform = localStorage.currentPlatform || 'production';
    var creds = JSON.parse(localStorage[platform]);
    if (creds) {
      $scope.logInMessage = 'Welcome, ' + creds.user;
    }
    else {
      $scope.logInMessage = 'Log in';
    }
  }
  
  function determinePlatform($scope) {
    $scope.platform = localStorage.currentPlatform || 'production';
  }

  function DocsTableController($scope, $window, PMP) {
    determineLogIn($scope);
    determinePlatform($scope);
    $scope.loading = true;

    var onTableComplete = function(docs) {
      $scope.loading = false;
      $scope.docs = docs;
      var creds = JSON.parse(localStorage[$scope.platform]);
      $scope.userGUID = creds.userGUID;
    }
  
    $scope.limitQuery = function() {
      $scope.loading = true;
      var params = {
        'limit': 20
      };
      if ($scope.profile != 'all') {
        params.profile = $scope.profile;
      }
      if ($scope.creator != 'all') {
        params.creator = $scope.creator;
      }
      if ($scope.has != 'any') {
        params.has = $scope.has;
      }
      if ($scope.collection != 'any') {
        params.collection = $scope.collection;
      }
      if ($scope.text != '') {
        params.text = $scope.text;
      }
      PMP.getDocs(params).then(onTableComplete);
    }
    
    if (!localStorage.loggedIn) {
      $window.location='#login';  
    }
    else if (!$scope.hasOwnProperty("profile")) {
      $scope.profile = 'story';
      $scope.creator = 'all';
      $scope.has = 'any';
      $scope.collection = 'any';
      $scope.limitQuery();
    }
  }
  app.controller('DocsTableController', ["$scope", "$window", "PMP", DocsTableController]);
  
  function PMPShowController($scope, PMP, $routeParams, $sce) {
    determineLogIn($scope);
    determinePlatform($scope);
    
    $scope.isObject = function (obj) {
      return typeof obj === 'object' && obj !== null;
    }
    
    function loopObject(obj) {
      var elements = [];
      var value;
      for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          value = obj[prop];
          var valueType, valueCount;
          if (value instanceof Object) {
            if (value instanceof Array) {
              valueType = 'Array';
              valueCount = value.length + " elements"; 
            }
            else {
              valueType = 'Object';
              valueCount = Object.keys(obj).length + " properties";
            }
          }
          
          if (value instanceof Number) {
            valueType = 'Number';
            valueCount = value.length;
          }
          
          if (typeof value === 'string') {
            valueType = 'String';
            valueCount = value.length + " characters";
          }

          //var fullProp = prop + " [" + valueType + ", " + valueCount  + "]";
          var meta = "[" + valueType + ", " + valueCount  + "]";
          if (typeof value === 'object' && value !== null) {
            elements.push("<li class='mumo-child'><div class='mumo-expand mumo-element'><span class='pmpLabel'>" + prop + "</span> " + meta + "</div>" + "<ul class='mumo-node'>" + loopObject(value) + "</ul></li>");
          }
          else {
            var preview = '', trimmed = '', elementClass = 'mumo-element';
            if (value !== null && value.length > 100) {
              trimmed = value.slice(0, 99) + "...";
              preview = "<div class='mumo-preview'>" + value + "</div>";
              elementClass = elementClass + " mumo-expand";
            }
            else {
              trimmed = value;
            }
            if (typeof trimmed === 'string') {
              trimmed = trimmed.replace(/<(?:.|\n)*?>/gm, '');
            }  
            elements.push("<li class='mumo-child'><div class='" + elementClass + "'><span class='pmpLabel'>" + prop + "</span> " + meta + " <span class='pmpValue'>" + trimmed + "</span></div>" + preview + "</li>");
          }
        }
      }
      return elements.join('\n');
    }
    
    var onDocComplete = function(doc) {
      $scope.info = $sce.trustAsHtml("<div class='mumo-root'>" + loopObject(doc) + '</div>');
    }
    var guid = $routeParams.guid;
    PMP.getDoc(guid).then(onDocComplete);
  }
  app.controller('PMPShowController', ["$scope", "PMP", "$routeParams", "$sce", PMPShowController]);

  function PMPEditController($scope, PMP, $routeParams) {
    determineLogIn($scope);
    determinePlatform($scope);

    var onDocComplete = function(doc) {
      $scope.doc = doc;
      $scope.title = doc.attributes.title;
      $scope.contentencoded = doc.attributes.contentencoded;
    }
    
    var onSendComplete = function(response) {
      $scope.message = 'Your post was saved.';
      $scope.details = JSON.stringify(response);
      console.log($scope);
    }
    
    $scope.sendDoc = function() {
      $scope.doc.attributes.contentencoded = $scope.contentencoded;
      $scope.doc.attributes.title = $scope.title;
      PMP.sendDoc($scope.doc).then(onSendComplete);  
    }

    var guid = $routeParams.guid;
    PMP.getDoc(guid).then(onDocComplete);
  }
  app.controller('PMPEditController', ["$scope", "PMP", "$routeParams", PMPEditController]);
  
  function PMPLoginController($scope, PMP, $location) {
  
    if (localStorage.loggedIn) {
      $location.path('/');
    }
  
    determineLogIn($scope);
    determinePlatform($scope);
    
    var platforms = ['production', 'sandox'];
    for (var i=0; i<platforms.length; i++) {
      var platform = platforms[i];
      var creds = (platform in localStorage) ? JSON.parse(localStorage.getItem(platform)) : null;
      if (creds && creds.client && creds.secret) {
        $scope[platform] = {
          client: creds.client,
          secret: creds.secret
        };
      }
    }

    $scope.saveLogin = function(platform) {
      var creds = {
        client: $scope[platform].client,
        secret: $scope[platform].secret  
      };
      localStorage.setItem(platform, JSON.stringify(creds));
      PMP.getCurrentUser().then(storeUser);
    }
    
    $scope.changePlatform = function() {
      window.localStorage.currentPlatform = $scope.platform;    
    }
    
    var storeUser = function(user) {
      localStorage.setItem('loggedIn', true);
      var platform = localStorage.currentPlatform || 'production';
      var creds = JSON.parse(localStorage[platform]);
      creds.user = user.attributes.title;
      creds.userGUID = user.attributes.guid;
      localStorage[platform] = JSON.stringify(creds);
    }
  }
  app.controller('PMPLoginController', ["$scope", "PMP", "$location", PMPLoginController]);  
  
  
}());