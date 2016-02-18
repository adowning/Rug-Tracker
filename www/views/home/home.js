'Use Strict';
angular.module('App').controller('homeController', function ($scope, $rootScope, $window, $state, $timeout, $firebaseArray,
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
      $location.path("/login");
    };
    $scope.doRefresh = function () {
      $http.get('/#/home')
        .success(function () {
          //$scope.items = newItems;
          $scope.apply();
        })
        .finally(function () {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
    };
    var jobList = function () {
      console.log('refreshing job list');
      Utils.show();
      $scope.jobList = [];
      var ref = new Firebase(FURL + 'jobs');

      ref.orderByChild("dateCreated").on("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if (!childData.deleted && !childData.completed) {
            $scope.jobList.push(childData);
            Utils.hide();
          }
        });
      });

    };
    jobList();
    var found = false;
    $scope.addPhone = function (job){
      $.ajax({
        type: "GET",
        url: "https://api.servicemonster.net/v1/accounts?q=" + job.accountID,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: function (error) {
          console.log(error)
        },
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic ZTZleGc0Nkw6bUM0RHM5MXFnZXdPUzFv");
        },
        complete: function (json) {
            // var ref = new Firebase(FURL + 'jobs');
            // var newChildRef = ref.push();
            // var time = new Date().getTime();
            //
            // $scope.newJob.dateCreated = time;
            // newChildRef.set($scope.newJob);
            // console.log('adding 2 ' + time);
            //get phone number
            // $scope.addPhone($scope.newJob)

          Utils.hide();
          $timeout(function () {
            //$location.path('/home');
            console.log($location.path());
            //$window.location.reload();
          });
        },
        success: function (json) {
          console.log(json.items[0]);
          var phone = json.items[0].phone1;
          var ref = new Firebase(FURL + 'jobs');
          var newChildRef = ref.push();
          var time = new Date().getTime();
          $scope.newJob.phone = phone;
          console.log(phone);
          $scope.newJob.dateCreated = time;
          newChildRef.set($scope.newJob);
          // var ref = new Firebase(FURL + 'jobs');
          // ref.once("value", function (snapshot) {
          //   snapshot.forEach(function (childSnapshot) {
          //     var key = childSnapshot.key();
          //     var childData = childSnapshot.val();
          //     if (json.items[0].orderNumber == childData.orderNumber) {
          //       console.log(found);
          //       if (childData.deleted) {
          //         console.log('deleted fool');
          //         return;
          //       }
          //       found = true;
          //     }
          //   });
          // });
          // if (!found) {
          //   $scope.newJob = json.items[0];
          //   console.log('adding 1')
          // }
        }
      });
    };
    $scope.addJob = function (job) {
      Utils.show();
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
            // var ref = new Firebase(FURL + 'jobs');
            // var newChildRef = ref.push();
            // var time = new Date().getTime();

            // $scope.newJob.dateCreated = time;
            //newChildRef.set($scope.newJob);
            // console.log('adding 2 ' + time);
            //get phone number
            $scope.addPhone($scope.newJob)

          }
          Utils.hide();
          $timeout(function () {
            //$location.path('/home');
            console.log($location.path());
            //$window.location.reload();
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
                if (childData.deleted) {
                  console.log('deleted fool');
                  return;
                }
                found = true;
              }
            });
          });
          if (!found) {
            $scope.newJob = json.items[0];
            console.log('adding 1')
          }else{
            alert('job exists');
          }
        }
      });
    };


  // filepicker.pick(
  //   function(Blob){
  //     console.log(Blob.url);
  //   }
  // );
  }
);
