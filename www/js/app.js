'Use Strict';
angular.module('App', ['ionic', 'ngStorage', 'ngCordova', 'firebase', 'ngMessages'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        cache: false,
        templateUrl: 'views/login/login.html',
        controller: 'loginController'
      })
      .state('forgot', {
        url: '/forgot',
        cache: false,
        templateUrl: 'views/forgot/forgot.html',
        controller: 'forgotController'
      })
      .state('register', {
        url: '/register',
        cache: false,
        templateUrl: 'views/register/register.html',
        controller: 'registerController'
      })
      .state('home', {
        url: '/home',
        cache: false,
        templateUrl: 'views/home/home.html',
        controller: 'homeController'
      })
      .state('allruglist', {
        url: '/allruglist',
        cache: false,
        templateUrl: 'views/allruglist/allruglist.html',
        controller: 'allRugListController'
      })
      .state('ruglist', {
        url: '/ruglist/?/id/customer/orderID',
        cache: false,
        templateUrl: 'views/ruglist/ruglist.html',
        controller: 'rugListController'
      })
      .state('rugedit', {
        url: '/rugedit/?/id/jobID/customer',
        cache: false,
        templateUrl: 'views/rugedit/rugedit.html',
        controller: 'rugEditController'
      })
    ;
    $urlRouterProvider.otherwise("/login");
  })
  // Changue this for your Firebase App URL.
  //  .constant('FURL', 'https://cfbuilder.firebaseio.com/') // developer
  //  .constant('FURL', 'https://cctools.firebaseio.com/') // live
  .run(function ($ionicPlatform, $rootScope) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if ((location.host.toString().indexOf('localhost') > -1 || location.host.toString().indexOf('192.168') > -1 ) && !location.host.toString().indexOf('rugtracker') > -1) {
        console.log('Setting local database');
        $rootScope.FURL = 'https://cfbuilder.firebaseio.com/';
      } else {
        console.log('Setting remote database');
        $rootScope.FURL = 'https://cctools.firebaseio.com/';
      }

      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      console.log('FURL = ' + $rootScope.FURL);
    });
  });

