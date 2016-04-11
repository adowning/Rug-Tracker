'Use Strict';
angular.module('App').controller('largeImageController', function ($scope, $rootScope, $timeout, $window, $rootScope, $cordovaCamera, $stateParams, $state, $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, Utils) {
    var FURL = $rootScope.FURL;
    console.log(FURL);

    if (!FURL) {
      if (location.host.toString().indexOf('localhost') > -1) {
        console.log('Setting local database');
        FURL = 'https://cfbuilder.firebaseio.com/';
      } else {
        console.log('Setting remote database');
        FURL = 'https://cctools.firebaseio.com/';
      }
    }

    $scope.isNewRug = false;
    $scope.customer = $stateParams.customer;
  $scope.key = $stateParams.id;
  console.log($stateParams.id);
  $scope.imageNumber = $stateParams.imageNumber;
    $scope.discussion = "";

  console.log($stateParams.id);

  var ref = new Firebase(FURL + '/images/' + $stateParams.id);

  ref.once("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var key = childSnapshot.key();
      var childData = childSnapshot.val();
      console.log(key);
      // console.log('image ' + childData.image);
      // if ($stateParams.id == key) {
      // if (key.toString().indexOf($scope.rug.key) > -1) {
      var number = key.substr(key.length - 1);
      // console.log('number ' + $scope.imageList.length);
      // document.getElementById("profileImage" + $scope.imageList.length).src = childData.image;
      document.getElementById("profileImage").src = childData.image;

      // $scope.imageList.push(childData);
      // console.log('a ' + $scope.imageList.length);

      // }

      // }
    });
    // console.log('a ' + $scope.imageList.length);

    Utils.hide();

  })



  }
);
