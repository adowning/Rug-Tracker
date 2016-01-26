'Use Strict';
angular.module('App').controller('rugEditController', function ($scope, $timeout, $rootScope, Camera, $cordovaCamera, $stateParams, $state, $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, FURL, Utils) {

    $scope.isNewRug = false;
    $scope.customer = $stateParams.customer;
    $scope.newRug = false;
    if ($stateParams.id == 'newrug') {
      $scope.newRug = true;
      $scope.rug = {};
      $scope.isNewRug = true;

      $scope.addRug = function (rug) {
        var date = new Date();

        rug.orderNumber = $stateParams.jobID;
        var ref = new Firebase(FURL + 'rugs');
        var newChildRef = ref.push();
        rug.key = newChildRef.key();
        rug.createdOn = date.toString();
        rug.status = 'NotStarted';
        rug.customer = $stateParams.customer;


        newChildRef.set(rug);

        var audit = {};
        var ref = new Firebase(FURL + 'audits');
        var newChildRef = ref.push();
        audit.key = newChildRef.key();
        audit.person = $localStorage.email;
        audit.time = date.toString();
        audit.rugKey = rug.key;
        audit.status = 'NotStarted';
        audit.description = rug.description;
        audit.preDamage = rug.preDamage;
        newChildRef.set(audit);

        var contact = {};
        var ref = new Firebase(FURL + 'contactEvents');
        var newChildRef = ref.push();
        contact.key = newChildRef.key();
        contact.value = rug.contact;
        contact.person = $localStorage.email;
        contact.time = date.toString();
        contact.rugKey = rug.key;
        newChildRef.set(contact);

        console.log('adding new rug')
        $timeout(function () {
          $location.path("/home");
          console.log($location.path());
        });


      }
    } else {
      var ref = new Firebase(FURL + 'rugs');
      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.key) {
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

        ref.once("value", function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key();
            var childData = childSnapshot.val();
            if ($stateParams.id == childData.rugKey) {
              $scope.auditList.push(childData)
            }
          });
          var contact = {};
          var ref = new Firebase(FURL + 'contactEvents');
          var newChildRef = ref.push();
          contact.key = newChildRef.key();
          contact.value = rug.contact;
          contact.person = $localStorage.email;
          var date = new Date();
          contact.time = date.toString();
          contact.rugKey = rug.key;
          newChildRef.set(contact);

          console.log('adding new rug')
          $timeout(function () {
            $location.path("/home");
            console.log($location.path());
          });
        });


      }
      $scope.deleteRug = function (rug) {
        var newChildRef = new Firebase(FURL + 'rugs/' + rug.key);
        console.log(rug.orderNumber + rug.customer)

        newChildRef.update({"deleted" : true});

        //newChildRef.remove();
        console.log('deleting rug')
        console.log('/ruglist/?id=' + rug.orderNumber + '&customer=' + rug.customer)
        //TODO fix me to go to rug list with proper customer
        //$location.path('#/ruglist/?id='+rug.orderNumber+'&customer='+rug.customer);
        $location.path('/home');

      }
      //$scope.deleteRug = function (rug) {
      //  var newChildRef = new Firebase(FURL + 'rugs/');
      //  newChildRef.once("value", function (snapshot) {
      //    snapshot.forEach(function (childSnapshot) {
      //      var key = childSnapshot.key();
      //      var childData = childSnapshot.val();
      //      if ($stateParams.id == childData.orderNumber) {
      //        console.log('deleting job ' + FURL + 'jobs/' + key)
      //        var newChildRef2 = new Firebase(FURL + 'jobs/' + key);
      //        newChildRef2.update({
      //          "deleted": true
      //        });
      //      }
      //    });
      //    $timeout(function () {
      //      $location.path("/home");
      //      console.log($location.path());
      //    });
      //  });
      //}

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
      $scope.contactList = [];
      var ref = new Firebase(FURL + 'contactEvents');

      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.rugKey) {
            $scope.contactList.push(childData)
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
