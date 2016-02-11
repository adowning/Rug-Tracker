'Use Strict';
angular.module('App').controller('allRugListController', function ($scope, $rootScope, $window, $state, $timeout, $firebaseArray,
                                                                   $cordovaOauth, $localStorage, $location, $http, $ionicPopup,
                                                                   $firebaseObject, Auth, Utils, $cordovaCamera) {

    //TODO get phone number from SM
    var FURL = $rootScope.FURL;
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

    $scope.sortList = function (value) {
//console.log('v ' + value);

      switch (value) {
        case 'By Due Date':
          $scope.rugList.sort(function (a, b) {
            if (!isFinite(a.dueIn - b.dueIn))
              return !isFinite(a.dueIn) ? 1 : -1;
            else
              return a.dueIn - b.dueIn;
          });
          break;
        case 'Status':
          //$scope.rugList.sort(function (a, b) {
          //  if (!isFinite(a.urine - b.urine))
          //    return !isFinite(a.urine) ? 1 : -1;
          //  else
          //    return a.urine - b.urine;
          //});
          //sort($scope.rugList, 'status');
          //function sort(arr) {
          //  arr.sort(function(a, b) {
          //    console.table(a)
          //    var nameA=a.status.toLowerCase(), nameB=b.status.toLowerCase();
          //    if (nameA < nameB) //sort string ascending
          //      return -1;
          //    if (nameA > nameB)
          //      return 1;
          //    return 0; //default return value (no sorting)
          //  });
          //}
        function keysrt(key) {
          return function (a, b) {
            if (a[key] > b[key]) return 1;
            if (a[key] < b[key]) return -1;
            return 0;
          }
        }

          $scope.rugList.sort(keysrt('status'));
          break;
        //TODO fix urine to urine first
        case 'Urine':

        function keysrt(key) {
          return function (a, b) {
            if (a[key] < b[key]) return 1;
            if (a[key] > b[key]) return -1;
            return 0;
          }
        }
          console.log('urine ');
          $scope.rugList.sort(keysrt('urine'));
          break;
        case 'Customer':
          console.log('cust ');
        function keysrt(key) {
          return function (a, b) {
            if (a[key] > b[key]) return 1;
            if (a[key] < b[key]) return -1;
            return 0;
          }
        }

          $scope.rugList.sort(keysrt('customer'));
          break;
        default:

      }

      //console.table( $scope.rugList);

      //function sortNumber(a,b)
      //{
      //  return a.dueIn - b.dueIn;
      //}
      //
      //$scope.rugList = $scope.rugList.sort(sortNumber);
      //console.table( $scope.rugList);

    };
    ;
    var rugList = function () {
      console.log('refreshing job list');
      Utils.show();
      $scope.rugList = [];
      var ref = new Firebase(FURL + 'rugs');
      $scope.fbRugs = ref;
      ref.orderByChild("createdOn").on("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {

          var childData = childSnapshot.val();
          var dueDate = new Date(childData.dueDate).getTime();
          //console.log('dd ' + dueDate);
          var creationDate = new Date(childData.createdOn).getTime();
          //console.log('cd ' + creationDate);
          var daysTillDue = ((dueDate - creationDate) / 1000) / 86400;
          //console.log('dtd ' + daysTillDue);
          childData.dueIn = Math.round(daysTillDue);
          //console.log('di ' + childData.dueIn);
          if (!childData.deleted) {
            //childData.customer = $scope.customer;
            $scope.rugList.push(childData);
            Utils.hide();
          }
        });
      });
      //console.table($scope.rugList)

    };
    rugList();
    //  var found = false;
    //
    //  $scope.addJob = function (job) {
    //    Utils.show();
    //    $.ajax({
    //      type: "GET",
    //      url: "https://api.servicemonster.net/v1/orders?q=" + job.id,
    //      contentType: "application/json; charset=utf-8",
    //      dataType: "json",
    //      error: function (error) {
    //        console.log(error)
    //      },
    //      beforeSend: function (xhr) {
    //        xhr.setRequestHeader("Authorization", "Basic ZTZleGc0Nkw6bUM0RHM5MXFnZXdPUzFv");
    //      },
    //      complete: function (json) {
    //        if (!found) {
    //          var ref = new Firebase(FURL + 'jobs');
    //          var newChildRef = ref.push();
    //          var time = new Date().getTime();
    //
    //          $scope.newJob.dateCreated = time;
    //
    //          newChildRef.set($scope.newJob);
    //          console.log('adding 2 ' + time)
    //        }
    //        Utils.hide();
    //        $timeout(function () {
    //          //$location.path('/home');
    //          console.log($location.path());
    //          //$window.location.reload();
    //        });
    //      },
    //      success: function (json) {
    //        console.log(json.items[0]);
    //        var ref = new Firebase(FURL + 'jobs');
    //        ref.once("value", function (snapshot) {
    //          snapshot.forEach(function (childSnapshot) {
    //            var key = childSnapshot.key();
    //            var childData = childSnapshot.val();
    //            if (json.items[0].orderNumber == childData.orderNumber) {
    //              console.log(found);
    //              if (childData.deleted) {
    //                console.log('deleted fool');
    //                return;
    //              }
    //              found = true;
    //            }
    //          });
    //        });
    //        if (!found) {
    //          $scope.newJob = json.items[0];
    //          console.log('adding 1')
    //        }
    //      }
    //    });
    //  };
    //
    ////$ionicHistory.clearHistory();
    //
    //$scope.images = [];
    //
    //var ref = new Firebase(FURL);
    //
    //var userReference = ref.child("images");
    //var syncArray = $firebaseArray(userReference.child("images"));
    //$scope.images = syncArray;
    //
    //
    //$scope.upload = function () {
    //  var options = {
    //    quality: 75,
    //    destinationType: Camera.DestinationType.DATA_URL,
    //    sourceType: Camera.PictureSourceType.CAMERA,
    //    allowEdit: true,
    //    encodingType: Camera.EncodingType.JPEG,
    //    popoverOptions: CameraPopoverOptions,
    //    targetWidth: 500,
    //    targetHeight: 500,
    //    saveToPhotoAlbum: false
    //  };
    //  $cordovaCamera.getPicture(options).then(function (imageData) {
    //    syncArray.$add({image: imageData}).then(function () {
    //      alert("Image has been uploaded");
    //    });
    //  }, function (error) {
    //    console.error(error);
    //  });
    //}


  }
);
