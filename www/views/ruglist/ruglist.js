'Use Strict';
angular.module('App').controller('rugListController', function ($scope, $rootScope, $timeout, $stateParams, $state,
                                                                $firebaseArray, $cordovaOauth, $localStorage, $location, $http,
                                                                $ionicPopup, $firebaseObject, Auth, Utils) {
  var FURL = $rootScope.FURL;
  $scope.rugCount = 0;
  $scope.jobID = $stateParams.id;
  $scope.customer = $stateParams.customer;
  $scope.logOut = function () {
    Auth.logout();
    $location.path("/login");
  };
  $scope.doRefresh = function () {
    $http.get('/#/home')
      .success(function () {
        //$scope.items = newItems;
      })
      .finally(function () {
        // Stop the ion-refresher from spinning
        console.log('refreshed');
        $timeout(function () {
          $location.path('/home');
          console.log($location.path());
        });
        $scope.$broadcast('scroll.refreshComplete');
      });
  };
  var rugList = function () {
    Utils.show();
    $scope.rugList = [];
    var ref = new Firebase(FURL + 'rugs');
    ref.once("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key();
        var childData = childSnapshot.val();
        if ($stateParams.id == childData.orderNumber && !childData.deleted) {
          //var date = new Date().getTime();
          //var thisDate = new Date(childData.createdOn).getTime();
          //var daysSince = ((date - thisDate) / 1000) / 86400;
          //childData.elapsedTime = Math.round(daysSince);
          var dueDate = new Date(childData.dueDate).getTime();
          console.log(dueDate);
          var creationDate = new Date(childData.createdOn).getTime();
          console.log(creationDate);

          var daysTillDue = ((dueDate - creationDate) / 1000) / 86400;
          console.log((daysTillDue));
          childData.dueIn = Math.round(daysTillDue);
          //childData.elapsedTime = Math.round(daysSince);
          //truncating start date
          var sd = childData.createdOn.substring(0, 16);
          childData.createdOn = sd;
          $scope.rugList.push(childData);
          $scope.rugCount++;
        }
      });
      Utils.hide();
    });

  };
  rugList();
  $scope.deleteJob = function (job) {
    Utils.show();
    var newChildRef = new Firebase(FURL + 'jobs/');
    newChildRef.once("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key();
        var childData = childSnapshot.val();
        if ($stateParams.id == childData.orderNumber) {
          console.log('deleting job ' + FURL + 'jobs/' + key);
          var newChildRef2 = new Firebase(FURL + 'jobs/' + key);
          newChildRef2.update({
            "deleted": true
          });
        }
      });
      Utils.hide();
      $timeout(function () {
        $location.path("/home");
        console.log($location.path());
      });
    });
  }
});
