(function(){

  var PMP = function($http) {
    
    var creators = {
      '6140faf0-fb45-4a95-859a-070037fafa01': 'NPR',
      '7a865268-c9de-4b27-a3c1-983adad90921': 'PRI',
      '98bf597a-2a6f-446c-9b7e-d8ae60122f0d': 'APM',
      '609a539c-9177-4aa7-acde-c10b77a6a525': 'PRX',
      'fc53c568-e939-4d9c-86ea-c2a2c70f1a99': 'PBS',
      '39b744ba-e132-4ef3-9099-885aef0ff2f1': 'NPRDS'
    };
    
    var getURL = function() {
      if (window.localStorage.currentPlatform == 'sandbox') {
        return 'https://api-sandbox.pmp.io/';  
      }
      else {
        return 'https://api.pmp.io/';  
      }
    }
 
    var getCurrentUser = function() {
      return getToken().then(
        function(token) {
          return $http({
            'method': 'GET',
            'url': getURL() + 'users/me',
            'headers': {
              'Authorization': 'Bearer ' + token
            }
          }).then(function(response) {
            return response.data;
          });
        }
      );             
    }

    var getToken = function() {
      var platform = localStorage.getItem('currentPlatform') || 'production';
      if (platform in localStorage) {
        var creds = JSON.parse(localStorage[platform]);
        var client = creds.client;
        var secret = creds.secret;
        var base64 = btoa(client + ":" + secret);
        var request = $http.post(
          getURL() + 'auth/access_token',
            {'grant_type': 'client_credentials'},
            {'headers': {
              'Authorization': 'Basic ' + base64,
              'Content-Type': 'application/x-www-form-urlencoded'
          },
          }).then(function(response) {
          return response.data.access_token;
          });
        return request;
      }
    }

    var getDoc = function(guid) {
      return getToken().then(
        function(token) {
          return $http({
            'method': 'GET',
            'url': getURL() + 'docs',
            'params': {'guid': guid},
            'headers': {
              'Authorization': 'Bearer ' + token
            }
          }).then(function(response) {
            return response.data;
          });
        }
      );
    }
    
    var getDocs = function(params) {
      return getToken().then(
        function(token) {
          return $http({
            'method': 'GET',
            'url': getURL() + 'docs',
            'cache': true,
            'params': params,
            'headers': {
              'Authorization': 'Bearer ' + token,
            }
          }).then(function(response) {
            var docs = [];
            var items = response.data.items;
            for (var i = 0; i < items.length; i++) {
              var href = items[i].links.profile[0].href;
              var pieces = href.split('/');
              var profile = pieces[pieces.length - 1];
              items[i].profile = profile;
              
              var href = items[i].links.creator[0].href;
              var pieces = href.split('/');
              var creatorGUID = pieces[pieces.length - 1];
              items[i].creatorGUID = creatorGUID;
              items[i].creator = creators[creatorGUID];
              
              docs.push(items[i]);
            }
            return docs;
        }, function(response) {
             return [];
        });
      });
    }
    
    var sendDoc = function(doc) {
      return getToken().then(
        function(token) {
          return $http({
            'method': 'PUT',
            'url': getURL() + 'docs' + doc.attributes.guid,
            'data': JSON.stringify(doc),
            'headers': {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/vnd.collection.doc+json'
            }
          }).then(function(response) {
           return response;
        });     
      });  
    }  
    
    return {
      getDocs: getDocs,
      getDoc: getDoc,
      sendDoc: sendDoc,
      getCurrentUser: getCurrentUser
    };
  }
  
  var module = angular.module("PMPViewer");
  module.factory("PMP", PMP);
}());