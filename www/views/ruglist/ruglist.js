'Use Strict';
angular.module('App').controller('rugListController', function ($scope, $stateParams, $state, $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, FURL, Utils) {
    var ref = new Firebase(FURL);
    $scope.jobID = $stateParams.id;
    $scope.customer = $stateParams.customer;
    $scope.logOut = function () {
      Auth.logout();
      $location.path("/login");
    }
    var rugList = function () {
      $scope.rugList = [];
      var ref = new Firebase(FURL + 'rugs');
      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.orderNumber) {
            //childData.customer = $scope.customer;
            $scope.rugList.push(childData)
          }
        });
      });

    }
    rugList();
  }
);
