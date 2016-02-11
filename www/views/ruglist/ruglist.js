'Use Strict';
angular.module('App').controller('rugListController', function ($scope, $rootScope, $timeout, $stateParams, $state,
                                                                $firebaseArray, $cordovaOauth, $localStorage, $location, $http,
                                                                $ionicPopup, $firebaseObject, $window, Auth, Utils) {
  var FURL = $rootScope.FURL;
  console.log(FURL);
  $scope.notAllPassed = false;
  if (!FURL) {
    if (location.host.toString().indexOf('localhost') > -1) {
      console.log('Setting local database');
      FURL = 'https://cfbuilder.firebaseio.com/';
    } else {
      console.log('Setting remote database');

      FURL = 'https://cctools.firebaseio.com/';
    }
  }
  $scope.deliveryObject = {};
  $scope.rugCount = 0;
  $scope.jobID = $stateParams.id;
  $scope.customer = $stateParams.customer;
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
        console.log('refreshed');
        $timeout(function () {
          $location.path('/home');
          console.log($location.path());
        });
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  $scope.addAudit = function (customer) {
    var audit = {};
    var ref = new Firebase(FURL + 'audits');
    var newChildRef = ref.push();
    audit.key = newChildRef.key();
    audit.person = $localStorage.email;
    var date = new Date();
    audit.time = date.toString();
    audit.customer = $scope.customer;
    newChildRef.set(audit);
  };

  var rugList = function () {
    Utils.show();
    $scope.rugList = [];
    var ref = new Firebase(FURL + 'rugs');
    ref.once("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key();
        var childData = childSnapshot.val();
        if ($stateParams.id == childData.orderNumber && !childData.deleted) {
          //var date = new Date().getTime();
          //var thisDate = new Date(childData.createdOn).getTime();
          //var daysSince = ((date - thisDate) / 1000) / 86400;
          //childData.elapsedTime = Math.round(daysSince);asdf
          var dueDate = new Date(childData.dueDate).getTime();
          console.log(dueDate);
          var creationDate = new Date(childData.createdOn).getTime();
          console.log(creationDate);

          var daysTillDue = ((dueDate - creationDate) / 1000) / 86400;
          console.log((daysTillDue));
          childData.dueIn = Math.round(daysTillDue);
          //childData.elapsedTime = Math.round(daysSince);
          //truncating start date
          var sd = childData.createdOn.substring(0, 16);
          childData.createdOn = sd;
          checkIfPassed(childData);
          $scope.rugList.push(childData);
          $scope.rugCount++;
        }
      });
      Utils.hide();
      console.log('allpassed '+$scope.notAllPassed);
    });

  };
  var checkIfPassed = function (rug) {
    console.log('rs  '+rug.status);
    if(rug.status !== 'PassedInspection'){
      $scope.notAllPassed = true;

    }
  }
  rugList();

  $scope.showDeliveryForm = false;
  $scope.showDeliveryFormChange = function () {
    console.log('asdfg ');
    $scope.showDeliveryForm ^= true;
  };

  $scope.contactList = [];
  var ref = new Firebase(FURL + 'contactEvents');

  ref.once("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      var key = childSnapshot.key();
      var childData = childSnapshot.val();
      if ($scope.customer == childData.customer) {
        $scope.contactList.push(childData)
      }
    });
    Utils.hide();
  });


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
    contact.rugKey = "general customer contact";
    newChildRef.set(contact);
    $scope.contactList = [];
    $scope.addAudit($scope.customer);

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

  $scope.showDiscussionsChange = function () {
    $scope.showDiscussions ^= true;
  };


  $scope.deleteJob = function (job) {
    Utils.show();
    var newChildRef = new Firebase(FURL + 'jobs/');
    newChildRef.once("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key();
        var childData = childSnapshot.val();
        if ($stateParams.id == childData.orderNumber) {
          console.log('deleting job ' + FURL + 'jobs/' + key);
          var newChildRef2 = new Firebase(FURL + 'jobs/' + key);
          newChildRef2.update({
            "deleted": true
          });
        }
      });
      Utils.hide();
      $timeout(function () {
        $location.path("/home");
        console.log($location.path());
      });
    });
  }

  //TODO remove me not really needed just use complete function
  $scope.setDeliveryDate = function (deliveryObject){
    console.log('deliveryObject '+deliveryObject.deliveryDate);
    $scope.completeJob(deliveryObject);
  }
  $scope.completeJob = function (deliveryObject) {
    Utils.show();
    var newChildRef = new Firebase(FURL + 'jobs/');
    newChildRef.once("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key();
        var childData = childSnapshot.val();
        if ($stateParams.id == childData.orderNumber) {
          console.log('deleting job ' + FURL + 'jobs/' + key);
          var newChildRef2 = new Firebase(FURL + 'jobs/' + key);
          newChildRef2.update({
            "completed": true,
            "deliveryDate": deliveryObject.deliveryDate,
            "deliveryNotes": deliveryObject.deliveryNotes
          });
        }
      });
      Utils.hide();
      $timeout(function () {
        $location.path("/home");
        console.log($location.path());
      });
    });
  }

});
