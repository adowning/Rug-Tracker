'Use Strict';
angular.module('App').controller('rugListController', function ($scope, $timeout, $stateParams, $state, $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, FURL, Utils) {
    var ref = new Firebase(FURL);
  $scope.rugCount = 0;
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
          if ($stateParams.id == childData.orderNumber && !childData.deleted) {
            //childData.customer = $scope.customer;

            var date = new Date();
            var thisDate = new Date(childData.createdOn);
            console.log(date + ' ' + thisDate)
            var date = new Date().getTime();
            var thisDate = new Date(childData.createdOn).getTime();
            console.log(((date - thisDate) / 1000) / 86400);
            var daysSince = ((date - thisDate) / 1000) / 86400;
            console.log(Math.round(daysSince));
            childData.elapsedTime = Math.round(daysSince);
            $scope.rugList.push(childData)
            $scope.rugCount ++;
          }
        });
      });

    }
    rugList();
    $scope.deleteJob = function (job) {
      var newChildRef = new Firebase(FURL + 'jobs/');
      newChildRef.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.orderNumber) {
            console.log('deleting job ' + FURL + 'jobs/' + key)
            var newChildRef2 = new Firebase(FURL + 'jobs/' + key);
            newChildRef2.update({
              "deleted": true
            });
          }
        });
        $timeout(function () {
          $location.path("/home");
          console.log($location.path());
        });
      });
    }
      //console.log(rug.orderNumber + rug.customer)

      //newChildRef.remove();
      //console.log('/ruglist/?id=' + rug.orderNumber + '&customer=' + rug.customer)
      //TODO fix me to go to rug list with proper customer
      //$location.path('#/ruglist/?id='+rug.orderNumber+'&customer='+rug.customer);



});
