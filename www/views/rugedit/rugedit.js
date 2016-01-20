'Use Strict';
angular.module('App').controller('rugEditController', function ($scope, Camera, $cordovaCamera,  $stateParams, $state, $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, FURL, Utils) {

  //
  //$scope.upload = function() {
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
  //$scope.getPhoto = function () {
  //  var options =   {
  //    quality: 50,
  //    destinationType: Camera.DestinationType.DATA_URL,
  //    sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
  //    encodingType: 0     // 0=JPG 1=PNG
  //  }
  //  // Take picture using device camera and retrieve image as base64-encoded string
  //  navigator.camera.getPicture(onSuccess,onFail,options);
  //  //console.log(Camera)
  //  //Camera.getPicture().then(function (imageURI) {
  //  //  console.log(imageURI);
  //  //}, function (err) {
  //  //  console.err(err);
  //  //});
  //}
    $scope.isNewRug = false;
    $scope.customer = $stateParams.customer;
    $scope.newRug = false;
    if ($stateParams.id == 'newrug') {
      $scope.newRug = true;
      $scope.rug = {};
      $scope.isNewRug = true;

      $scope.addRug = function (rug) {
        rug.orderNumber = $stateParams.jobID;
        var ref = new Firebase(FURL + 'rugs');
        var newChildRef = ref.push();
        console.log(newChildRef.key())
        rug.key = newChildRef.key();
        rug.status = 'NotStarted';
        console.log($stateParams.customer)
        rug.customer = $stateParams.customer;

        newChildRef.set(rug);

        var audit = {};
        var ref = new Firebase(FURL + 'audits');
        var newChildRef = ref.push();
        console.log(newChildRef.key())
        audit.key = newChildRef.key();
        audit.person = $localStorage.email;
        var date = new Date();
        audit.time = date.toString();
        audit.rugKey = rug.key;
        audit.status = 'NotStarted';
        audit.description = rug.description;
        audit.preDamage = rug.preDamage;
        newChildRef.set(audit);

        console.log('adding new rug')
        $location.path('/home');
      }
    } else {
      var ref = new Firebase(FURL + 'rugs');
      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.key) {
            console.log(childData.key);
            $scope.rug = childData;

          }
        });
      });

      $scope.addRug = function (rug) {
        rug.orderNumber = $stateParams.jobID;

        var newChildRef = new Firebase(FURL + 'rugs/' + rug.key);
        newChildRef.set(rug);

        var ref = new Firebase(FURL + 'audits');
        var newChildRef = ref.push();
        console.log(newChildRef.key())
        var audit = {};
        audit.key = newChildRef.key();
        audit.rugKey = rug.key;
        audit.status = rug.status;
        audit.description = rug.description;
        audit.preDamage = rug.preDamage;
        audit.person = $localStorage.email;
        var date = new Date();
        audit.time = date.toString();
        newChildRef.set(audit);
        console.log('editing rug rug')
        $scope.auditList = [];
        var ref = new Firebase(FURL + 'audits');
        console.log('hi1')

        ref.once("value", function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key();
            var childData = childSnapshot.val();
            if ($stateParams.id == childData.rugKey) {
              $scope.auditList.push(childData)
              //console.log('pushinig to auditylist')
            }
          });
          $scope.$apply();
          //TODO why does this not work? lol
          $location.path('/home')

        });

      }
      $scope.deleteRug = function (rug) {
        var newChildRef = new Firebase(FURL + 'rugs/' + rug.key);
        console.log(rug.orderNumber+rug.customer)

        newChildRef.remove();
        console.log('deleting rug')
        console.log('/ruglist/?id='+rug.orderNumber+'&customer='+rug.customer)
        //TODO fix me to go to rug list with proper customer
        //$location.path('#/ruglist/?id='+rug.orderNumber+'&customer='+rug.customer);
        $location.path('/home');

      }
      $scope.auditList = [];
      var ref = new Firebase(FURL + 'audits');
      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.rugKey) {
            $scope.auditList.push(childData)
            console.log('pushinig to auditylist')
          }
        });
      });
    }



    $scope.logOut = function () {
      Auth.logout();
      $location.path("/login");
    }



  }
);
