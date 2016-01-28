'Use Strict';
angular.module('App').controller('rugEditController', function ($scope, $timeout, $window, $rootScope, Camera, $cordovaCamera, $stateParams, $state, $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, FURL, Utils) {

    $scope.isNewRug = false;
    $scope.customer = $stateParams.customer;
    $scope.newRug = false;
    $scope.discussion = "";
    //$scope.discussion.value = "asdf";

  //$scope.valueEnteredChanged = function () {
  //  // more robust logic here
  //  //$scope.value = $scope.valueEntered * 100;
  //  console.log('hi')
  //  $scope.discussion = "asdf";
  //  $timeout(function () {
  //    $scope.discussion = '';
  //    $scope.$apply();
  //    //console.log($location.path());
  //  });
  //
  //}

  $scope.doRefresh = function() {
    $http.get('/#/home')
      .success(function (newItems) {
        $scope.items = newItems;
      })
      .finally(function () {
        // Stop the ion-refresher from spinning
        console.log('refreshed')
        $timeout(function () {
          $location.path('/home');
          console.log($location.path());
        });
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  $scope.showDiscussions = false;
  //TODO this if/then should basically just include whether to download or start new rug instead of duplicating
  //the add function the add function
    if ($stateParams.id == 'newrug') {
      $scope.newRug = true;
      $scope.rug = {};
      $scope.isNewRug = true;
      var oldDateObj = new Date();
      var newDateObj = new Date(oldDateObj.getTime() + 1814400000);
      var milliseconds = Date.parse(newDateObj);
      $scope.rug.dueDate = new Date(milliseconds);

      $scope.addRug = function (rug) {
        var date = new Date();

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
        //var oldDateObj = new Date();
        //var newDateObj = new Date(oldDateObj.getTime() + diff*1814400000);
        //rug.dueDate = newDateObj;
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
        audit.photosTaken = rug.photosTaken;
        audit.urine = rug.urine;
        audit.dueDate = rug.dueDate;
        newChildRef.set(audit);
        try{
          if(rug.contact.length > 0){
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
        catch(e){
console.log('no contact discussion to add')
        }



        console.log('adding new rug')
        $timeout(function () {
          $location.path("/home");
          console.log($location.path());
        });


      }
    } else {
      var ref = new Firebase(FURL + 'rugs');
      console.log('loading rug')
      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          if ($stateParams.id == childData.key) {
            var milliseconds = Date.parse(childData.dueDate);
            childData.dueDate = new Date(milliseconds);
            console.log('converting to date from string')
            $scope.rug = childData;

          }
        });
      });
      $scope.addRug = function (rug) {
        rug.orderNumber = $stateParams.jobID;
        console.log('editing ' + rug.dueDate)
        rug.dueDate = rug.dueDate.toString();
        var newChildRef = new Firebase(FURL + 'rugs/' + rug.key);
        rug.contact = null;
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
        audit.photosTaken = rug.photosTaken;
        audit.urine = rug.urine;
        audit.dueDate = rug.dueDate;
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

  $scope.addDiscussion = function (disc) {
    console.log(disc)
    var contact = {};
    var ref = new Firebase(FURL + 'contactEvents');
    var newChildRef = ref.push();
    contact.key = newChildRef.key();
    contact.value = disc;
    contact.person = $localStorage.email;
    var date = new Date();
    contact.time = date.toString();
    contact.rugKey = $scope.rug.key;
    newChildRef.set(contact);
    $scope.contactList = [];
    var audit = {};
    var ref = new Firebase(FURL + 'audits');
    var newChildRef = ref.push();
    audit.key = newChildRef.key();
    audit.rugKey = $scope.rug.key;
    audit.status = $scope.rug.status;
    audit.description = $scope.rug.description;
    audit.preDamage = $scope.rug.preDamage;
    audit.person = $localStorage.email;
    audit.discussion = true;
    audit.discussionValue = disc;
    audit.dueDate = $scope.rug.dueDate;

    var date = new Date();
    audit.time = date.toString();
    newChildRef.set(audit);
    ref.once("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key();
        var childData = childSnapshot.val();
        if ($stateParams.id == childData.rugKey) {
          $scope.contactList.push(childData)
        }
      });
      //$scope.discussion = '';

      $window.location.reload();
    });
    //$scope.$apply(function(){$scope.discussion.value = '';});
    //$scope.discussion = '';
    //
    //$timeout(function () {
    //  $scope.discussion = '';
    //  $scope.$apply();
    //  //console.log($location.path());
    //});
    //console.log($scope.discussion)
  }
    $scope.showAuditsChange = function () {
      $scope.showAudits ^= true;
    }
  $scope.showDiscussionsChange = function () {
    $scope.showDiscussions ^= true;
  }
    $scope.logOut = function () {
      Auth.logout();
      $location.path("/login");
    }


  var disabledDates = [
    new Date(1437719836326),
    new Date(2015, 7, 10), //months are 0-based, this is August, 10th!
    new Date('Wednesday, August 12, 2015'), //Works with any valid Date formats like long format
    new Date("08-14-2015"), //Short format
    new Date(1439676000000) //UNIX format
  ];
  var monthList = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  $scope.datepickerObject = {};
  $scope.datepickerObject.inputDate = new Date();

  $scope.datepickerObjectModal = {
    titleLabel: 'Ionic-Datepicker', //Optional
    todayLabel: 'Today', //Optional
    closeLabel: 'Close', //Optional
    setLabel: 'Set', //Optional
    errorMsgLabel : 'Please select time.', //Optional
    setButtonType : 'button-assertive', //Optional
    modalHeaderColor:'bar-positive', //Optional
    modalFooterColor:'bar-positive', //Optional
    templateType:'modal', //Optional
    inputDate: $scope.datepickerObject.inputDate, //Optional
    mondayFirst: true, //Optional
    disabledDates:disabledDates, //Optional
    monthList:monthList, //Optional
    from: new Date(2012, 5, 1), //Optional
    to: new Date(2016, 7, 1), //Optional
    callback: function (val) { //Optional
      datePickerCallbackModal(val);
    }
  };
  var datePickerCallbackModal = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObjectModal.inputDate = val;
      console.log('Selected date is : ', val)
    }
  };

  }
);
