'Use Strict';
angular.module('App').controller('homeController', function ($scope, $rootScope, $window, $state, $timeout, $firebaseArray,
                                                             $cordovaOauth, $localStorage, $location, $http, $ionicPopup,
                                                             $firebaseObject, Auth, Utils) {

    //TODO get phone number from SM
  var FURL = $rootScope.FURL;
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
          $scope.$broadcast('scroll.refreshComplete');
        });
    };
    var jobList = function () {
      $scope.jobList = [];
      var ref = new Firebase(FURL + 'jobs');

      ref.orderByChild("dateCreated").on("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if (!childData.deleted) {
            //childData.customer = $scope.customer;
            $scope.jobList.push(childData)
          }
        });
      });

    };
    jobList();
    var found = false;

    $scope.addJob = function (job) {
      $.ajax({
        type: "GET",
        url: "https://api.servicemonster.net/v1/orders?q=" + job.id,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: function (error) {
          console.log(error)
        },
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic ZTZleGc0Nkw6bUM0RHM5MXFnZXdPUzFv");
        },
        complete: function (json) {
          if (!found) {
            var ref = new Firebase(FURL + 'jobs');
            var newChildRef = ref.push();
            var time = new Date().getTime();
            $scope.newJob.dateCreated = time;

            newChildRef.set($scope.newJob);
            console.log('adding 2 ' + time)
          }
          $timeout(function () {
            $location.path('/home');
            console.log($location.path());
            $window.location.reload();
          });
        },
        success: function (json) {
          console.log(json.items[0]);
          var ref = new Firebase(FURL + 'jobs');
          ref.once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
              var key = childSnapshot.key();
              var childData = childSnapshot.val();
              if (json.items[0].orderNumber == childData.orderNumber) {
                console.log(found);
                found = true;
              }
            });
          });
          if (!found) {
            $scope.newJob = json.items[0];
            console.log('adding 1')
          }
        }
      });
    }
  }
);
