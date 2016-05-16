'Use Strict';
angular.module('App').controller('allRugListController', function ($scope, $rootScope, $window, $state, $timeout, $firebaseArray,
                                                                   $cordovaOauth, $localStorage, $location, $http, $ionicPopup,
                                                                   $firebaseObject, Auth, Utils) {

      if (location.host.toString().indexOf('localhost') > -1) {
        console.log('Setting local database');
        FURL = 'https://cfbuilder.firebaseio.com/';
      } else {
        console.log('Setting remote database');

        FURL = 'https://cctools.firebaseio.com/';
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

  var pdf = new jsPDF('p', 'pt', 'a4');

  pdf.setFontSize(16);
  $scope.printDocument = function () {
    console.log('printing');
    pdf.save('rug-list.pdf');
  };
    $scope.sortList = function (value) {

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
        case 'Date In':
          console.log('Date In ');
        function keysrt(key) {
          console.log(key);
          return function (a, b) {
            // console.log(a[key]);
            var a = new Date(a[key]);
            console.log(a);
            if (a[key] > b[key]) return 1;
            if (a[key] < b[key]) return -1;
            return 0;
          }
        }

          $scope.rugList.sort(keysrt('createdOn'));
          break;
        default:

      }


    };
    var rugList = function () {
      console.log('refreshing job list');

      // pdf.text(35, 25, "Rug List");
      Utils.show();
      $scope.rugList = [];
      var ref = new Firebase(FURL + 'rugs');
      $scope.fbRugs = ref;
      var l = 50;
      var date = new Date();
      pdf.text(20, 20, 'printed on : ' + date.toString());
      pdf.setLineWidth(0.5);
      pdf.line(20, 30, 120, 30);
      ref.orderByChild("createdOn").on("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {


          var childData = childSnapshot.val();
          // if (!childData.deleted) {

          var dueDate = new Date(childData.dueDate).getTime();


          //console.log('dd ' + dueDate);
          var creationDate = new Date(childData.createdOn).getTime();
          //console.log('cd ' + creationDate);
          //console.log('asdf ' + ((dueDate - creationDate) / 86400000));
          var today = new Date();
          var daysTillDue = ((dueDate - today) / 1000) / 86400;
          // console.log('dtd ' + daysTillDue);
          // console.log('rug key ' + childData.key);
          childData.dueIn = Math.round(daysTillDue);

          // console.log('di ' + childData.dueIn);
            //childData.customer = $scope.customer;
          if (!childData.completed && !childData.deleted) {
            pdf.text(20, l, childData.customer);
            l += 18;
            if (childData.dueIn) {
              // console.log(childData.dueIn);
              pdf.text(20, l, childData.dueDate.toString());
              l += 18;
            }
            pdf.text(20, l, childData.status);
            l += 18;
            pdf.text(20, l, childData.description);
            l += 18;
            pdf.setLineWidth(0.5);
            pdf.line(20, l, 120, l);
            // pdf.text(20, l, l.toString())
            l += 23;
            if (l > 780) {
              pdf.addPage();
              l = 30;
            }
            $scope.rugList.push(childData);

          }
            Utils.hide();
          // }
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
