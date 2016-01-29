'Use Strict';
angular.module('App', ['ionic',  'ngStorage', 'ngCordova','firebase','ngMessages'])
.config(function($stateProvider, $urlRouterProvider) {
$stateProvider
    .state('login', {
      url: '/login',
      cache: false,
      templateUrl: 'views/login/login.html',
      controller:'loginController'
    })
    .state('forgot', {
      url: '/forgot',
      cache: false,
      templateUrl: 'views/forgot/forgot.html',
      controller:'forgotController'
    })
    .state('register', {
      url: '/register',
      cache: false,
      templateUrl: 'views/register/register.html',
      controller:'registerController'
    })
    .state('home', {
      url: '/home',
      cache: false,
      templateUrl: 'views/home/home.html',
      controller:'homeController'
    })
  .state('ruglist', {
    url: '/ruglist/?/id/customer',
    cache: false,
    templateUrl: 'views/ruglist/ruglist.html',
    controller:'rugListController'
  })
  .state('rugedit', {
    url: '/rugedit/?/id/jobID/customer',
    cache: false,
    templateUrl: 'views/rugedit/rugedit.html',
    controller:'rugEditController'
  })
    ;
$urlRouterProvider.otherwise("/login");
})
// Changue this for your Firebase App URL.
  .constant('FURL', 'https://cfbuilder.firebaseio.com/') // developer
//  .constant('FURL', 'https://cctools.firebaseio.com/') // live
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}).service('env', function env() {

  var _environments = {
      local: {
        host: 'localhost:3000',
        config: {
          apiroot: 'http://localhost:3000'
        }
      },
      dev: {
        host: 'dev.com',
        config: {
          apiroot: 'http://localhost:3000'
        }
      },
      test: {
        host: 'test.com',
        config: {
          apiroot: 'http://localhost:3000'
        }
      },
      stage: {
        host: 'stage.com',
        config: {
          apiroot: 'staging'
        }
      },
      prod: {
        host: 'production.com',
        config: {
          apiroot: 'production'
        }
      }
    },
    _environment;

  return {
    getEnvironment: function () {
      var host = window.location.host;
      if (_environment) {
        return _environment;
      }

      for (var environment in _environments) {
        if (typeof _environments[environment].host && _environments[environment].host == host) {
          _environment = environment;
          return _environment;
        }
      }

      return null;
    },
    get: function (property) {
      return _environments[this.getEnvironment()].config[property];
    }
  }
});

