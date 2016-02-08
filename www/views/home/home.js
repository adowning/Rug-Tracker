'Use Strict';
angular.module('App').controller('homeController', function ($scope, $rootScope, $window, $state, $timeout, $firebaseArray,
                                                             $cordovaOauth, $localStorage, $location, $http, $ionicPopup,
                                                             $firebaseObject, Auth, Utils, $cordovaCamera) {

    //TODO get phone number from SM
    var FURL = $rootScope.FURL;
    console.log(FURL);
    var Camera = navigator.camera;
    if (!FURL) {
      if (location.host.toString().indexOf('localhost') > -1) {
        console.log('Setting local database');
        FURL = 'https://cfbuilder.firebaseio.com/';
      } else {
        console.log('Setting remote database');

        FURL = 'https://cctools.firebaseio.com/';
      }
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
          if (!childData.deleted) {
            //childData.customer = $scope.customer;
            $scope.jobList.push(childData);
            Utils.hide();
          }
        });
      });

    };
    jobList();
    var found = false;

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
            var ref = new Firebase(FURL + 'jobs');
            var newChildRef = ref.push();
            var time = new Date().getTime();

            $scope.newJob.dateCreated = time;

            newChildRef.set($scope.newJob);
            console.log('adding 2 ' + time)
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
          }
        }
      });
    };

    //$ionicHistory.clearHistory();

    $scope.images = [];

    var ref = new Firebase(FURL);

    var userReference = ref.child("images");
    var syncArray = $firebaseArray(userReference.child("images"));
    $scope.images = syncArray;


    $scope.upload = function () {
      var options = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function (imageData) {
        syncArray.$add({image: imageData}).then(function () {
          alert("Image has been uploaded");
        });
      }, function (error) {
        console.error(error);
      });
    }


  }
);
