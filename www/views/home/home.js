'Use Strict';
angular.module('App').controller('homeController', function ($scope, $state, $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, FURL, Utils) {
    var ref = new Firebase(FURL);

    $scope.logOut = function () {
      Auth.logout();
      $location.path("/login");
    }
    var jobList = function (){
      var ref = new Firebase(FURL + 'jobs');
      $scope.jobs = $firebaseArray(ref);
      var query = ref.orderByChild("timestamp").limitToLast(35);
      $scope.jobList = $firebaseArray(query);
      console.log('reloaded')
    }
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
          if(!found){
            var ref = new Firebase(FURL + 'jobs');
            var newChildRef = ref.push();
            newChildRef.set($scope.newJob);
            console.log('adding 2')
          }
        },
        success: function (json) {
          console.log(json.items[0]);
          var ref = new Firebase(FURL + 'jobs');
          ref.once("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
              var key = childSnapshot.key();
              var childData = childSnapshot.val();
              if(json.items[0].orderNumber == childData.orderNumber){
                console.log(found);
                found = true;
              }
            });
          });
          if(!found){
            $scope.newJob = json.items[0];
            console.log('adding 1')
          }
        }
      });
    }
  }
);
