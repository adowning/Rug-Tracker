'Use Strict';
angular.module('App').controller('rugEditController', function ($scope, $rootScope, $timeout, $window, $rootScope, $cordovaCamera, $stateParams, $state, $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, Utils) {
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
    $scope.newRug = false;
    $scope.discussion = "";

    $scope.doRefresh = function () {
      $http.get('/#/home')
        .success(function (newItems) {
          $scope.items = newItems;
        })
        .finally(function () {
          // Stop the ion-refresher from spinning
          console.log('refreshed');
          $timeout(function () {
            $location.path('/home');
            console.log($location.path());
          });
          $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.showDiscussions = false;

    $scope.addAudit = function (rug) {
      console.log('adding audit ' + rug.key);
      var audit = {};
      var ref = new Firebase(FURL + 'audits');
      var newChildRef = ref.push();
      audit.key = newChildRef.key();
      audit.person = $localStorage.email;
      var date = new Date();
      audit.time = date.toString();
      audit.rugKey = rug.key;
      audit.status = rug.status;
      audit.description = rug.description;
      audit.preDamage = rug.preDamage;
      audit.dueDate = rug.dueDate;

      try {
        audit.preDamage = rug.preDamage;
      } catch (err) {
        audit.preDamage = 'none';
      }

      try {
        audit.photosTaken = rug.photosTaken;
        console.log('2');
        if (!rug.photosTaken) {
          console.log('3');
          audit.photosTaken = false;
        }
      } catch (err) {
        console.log(err);
        console.log('4');
        audit.photosTaken = 'none';
      }

      try {
        audit.urine = rug.urine;
        if (!rug.urine) {
          console.log('3');
          audit.urine = false;
        }
      } catch (err) {
        console.log(err);
        audit.urine = false;
      }

      if (!rug.preDamage) {
        audit.preDamage = 'none';
      }
      newChildRef.set(audit);
    };

    if ($stateParams.id == 'newrug') {
      $scope.newRug = true;
      $scope.rug = {};
      $scope.isNewRug = true;
      var oldDateObj = new Date();
      var newDateObj = new Date(oldDateObj.getTime() + 1814400000);
      var milliseconds = Date.parse(newDateObj);
      $scope.rug.dueDate = new Date(milliseconds);

      $scope.addRug = function (rug) {
        Utils.show();
        var date = new Date();
        if (rug.length < rug.width) {
          var l = rug.length;
          var w = rug.width;
          rug.length = w;
          rug.width = l;
        }
        rug.orderNumber = $stateParams.jobID;
        var ref = new Firebase(FURL + 'rugs');
        var newChildRef = ref.push();
        rug.key = newChildRef.key();
        rug.createdOn = date.toString();
        rug.status = 'NotStarted';
        rug.customer = $stateParams.customer;
        var s = rug.dueDate.toString();
        rug.dueDate = s;
        newChildRef.set(rug);
        rug.status = "Not Started";
        $scope.addAudit(rug);
        try {
          if (rug.contact.length > 0) {
            var contact = {};
            var ref = new Firebase(FURL + 'contactEvents');
            var newChildRef = ref.push();
            contact.key = newChildRef.key();
            contact.value = rug.contact;
            contact.person = $localStorage.email;
            contact.time = date.toString();
            contact.rugKey = rug.key;
            newChildRef.set(contact);
          }
        }
        catch (e) {
          console.log('no contact discussion to add')
        }
        console.log('adding new rug');
        $timeout(function () {
          console.log('new rug added tranfering now ');
          Utils.hide();
          $window.location.assign('/#/ruglist/?id=' + $stateParams.jobID + '&customer=' + $stateParams.customer);

          console.log($location.path());
        });


      }
    } else {
      var ref = new Firebase(FURL + 'rugs');
      Utils.show();
      console.log('loading rug');
      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.key) {
            var milliseconds = Date.parse(childData.dueDate);
            childData.dueDate = new Date(milliseconds);
            console.log('converting to date from string');
            $scope.rug = childData;

          }
        });
      });
      $scope.addRug = function (rug) {
        rug.orderNumber = $stateParams.jobID;
        rug.dueDate = rug.dueDate.toString();
        var newChildRef = new Firebase(FURL + 'rugs/' + rug.key);
        rug.contact = null;
        newChildRef.set(rug);
        $scope.addAudit(rug);
        $timeout(function () {
          Utils.hide();
          //$location.path('/ruglist/?id=15044&customer=GABRIEL,%20BARBARA');
          //$window.location.assign('/#/ruglist/?id=15044&customer=GABRIEL,%20BARBARA');
          $window.location.assign('/#/ruglist/?id=' + $stateParams.jobID + '&customer=' + $stateParams.customer);


          console.log($location.path());
        });

      };

      $scope.deleteRug = function (rug) {
        var newChildRef = new Firebase(FURL + 'rugs/' + rug.key);
        newChildRef.update({"deleted": true});
        //TODO fix me to go to rug list with proper customer
        //$location.path('#/ruglist/?id='+rug.orderNumber+'&customer='+rug.customer);
        $location.path('/home');

      };

      $scope.auditList = [];
      var ref = new Firebase(FURL + 'audits');
      Utils.show();
      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.rugKey) {
            $scope.auditList.push(childData)
          }
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
          Utils.hide();
        });
      });


    }

    $scope.addDiscussion = function (disc) {
      console.log(disc);
      Utils.show();
      var contact = {};
      var ref = new Firebase(FURL + 'contactEvents');
      var newChildRef = ref.push();
      contact.key = newChildRef.key();
      contact.value = disc;
      contact.person = $localStorage.email;
      contact.customer = $scope.customer;
      var date = new Date();
      contact.time = date.toString();
      contact.rugKey = $scope.rug.key;
      newChildRef.set(contact);
      $scope.contactList = [];
      $scope.addAudit($scope.rug);

      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.rugKey) {
            $scope.contactList.push(childData)
          }
        });
        Utils.hide();
        $window.location.reload();
      });
    };
    $scope.showAuditsChange = function () {
      $scope.showAudits ^= true;
    };


  $scope.showDiscussionsChange = function () {
      $scope.showDiscussions ^= true;
    };
    $scope.logOut = function () {
      Auth.logout();
      $location.path("/login");
    };

  }
);
