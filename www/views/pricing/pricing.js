'Use Strict';
angular.module('App').controller('pricingController', function ($scope, $rootScope, $window, $state, $timeout, $firebaseArray,
                                                                $cordovaOauth, $localStorage, $location, $http, $ionicPopup,
                                                                $firebaseObject, Auth, Utils) {

    if ((location.host.toString().indexOf('localhost') > -1 || location.host.toString().indexOf('192.168') > -1 ) && !location.host.toString().indexOf('rugtracker') > -1) {
      console.log('Setting local database');
      var FURL = 'https://cfbuilder.firebaseio.com/';
    } else {
      console.log('Setting remote database');
      var FURL = 'https://cctools.firebaseio.com/';
    }

    $scope.logOut = function () {
      Auth.logout();
      $location.path("/pricing");
    };
    $scope.doRefresh = function () {
      $http.get('/#/pricing')
        .success(function (newItems) {
          console.log('refresh on pulldown ');
          $scope.items = newItems;
        })
        .finally(function () {
          // Stop the ion-refresher from spinning
          console.log('refreshed');
          $timeout(function () {
            $scope.showZipCode = true;
            $scope.invalidZip = false;
            $scope.showPricing = false;
            $location.path('/pricing');
            console.log($location.path());
          });
          $scope.$broadcast('scroll.refreshComplete');
        });
    };


    $scope.showZipCode = true;
    $scope.invalidZip = false;
    $scope.showPricing = false;

    $scope.setAllViewsToFalse = function () {
      $scope.showZipCode = false;
      $scope.showPricing = false;

    };

    $scope.zipCodeList = [];
    $scope.zipCodeList.push("75701");
    $scope.checkZip = function (zip) {
      console.log('checking zip ');
      $scope.setAllViewsToFalse();

      if ($scope.zipCodeList.indexOf(zip) > -1) {
        $scope.invalidZip = false;
        $scope.showPricing = true;
      } else {
        $scope.invalidZip = true;
        $scope.showZipCode = true;
      }
    }
  }
);
