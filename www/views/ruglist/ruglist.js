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
  $scope.recID = $stateParams.recID
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
        });
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  // $scope.getJob = function (id){
  //   console.log('ahit sp id   ' + id);
  //   var newChildRef = new Firebase(FURL + 'jobs/');
  //   newChildRef.orderByChild("orderNumber").equalTo(13222).on("value", function(snapshot) {
  //     var childData = snapshot.val();
  //     console.log(childData.jobID)
  //     console.log(childData.accountID)
  //     console.log(childData.orderID)
  //   });
  // }
  // $scope.getJob($stateParams.id)


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

        var childData = childSnapshot.val();
        if ($stateParams.id == childData.orderNumber && !childData.deleted) {
          //var date = new Date().getTime();
          //var thisDate = new Date(childData.createdOn).getTime();
          //var daysSince = ((date - thisDate) / 1000) / 86400;
          //childData.elapsedTime = Math.round(daysSince);asdf
          var dueDate = new Date(childData.dueDate).getTime();
          var creationDate = new Date(childData.createdOn).getTime();

          var daysTillDue = ((dueDate - creationDate) / 1000) / 86400;
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
    });

  };
  var checkIfPassed = function (rug) {
    if(rug.status !== 'PassedInspection'){
      $scope.notAllPassed = true;

    }
  }
  rugList();

  $scope.showDeliveryForm = false;
  $scope.showDeliveryFormChange = function () {
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
    contact.jobOrderNumber = $scope.jobID;

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
          var newChildRef2 = new Firebase(FURL + 'jobs/' + key);
          newChildRef2.update({
            "deleted": true
          });
        }
      });
      Utils.hide();
      $timeout(function () {
        $location.path("/home");
      });
    });
  }



  //TODO remove me not really needed just use complete function
  $scope.setDeliveryDate = function (deliveryObject){
    $scope.completeJob(deliveryObject);
  }
  $scope.completeJob = function (deliveryObject) {
    Utils.show();
    // Thu Feb 18 2016 00:00:00 GMT-0600 (CST)
    var date = new Date(deliveryObject.deliveryDate)

    $scope.devliveryNotes = deliveryObject.deliveryNotes;
    $scope.deliveryDate = deliveryObject.deliveryDate;
    if (!deliveryObject.deliveryDate) {
      alert('need a date')
      Utils.hide();
      return;
    }
    if (!deliveryObject.deliveryNotes) {
      $scope.deliveryNotes = "none";
    }
    var day = date.getDate();
    var monthIndex = date.getMonth() + 1;
    var year = date.getFullYear();

    var dateString = day + '-' + monthIndex + '-' + year;
    var endDateString = (day + 1) + '-' + monthIndex + '-' + year;
    var dateString2 = monthIndex + '-' + day + '-' + year;
    var endDateString2 = monthIndex + '-' + (day + 1) + '-' + year;
    $.ajax({
      type: "GET",
      url: "https://api.servicemonster.net/v1/scheduleItems?startDate=" + dateString2 + "&endDate=" + endDateString2,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      error: function (error) {
        console.log(error)
      },
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Basic ZTZleGc0Nkw6bUM0RHM5MXFnZXdPUzFv");
      },
      complete: function (json) {
        if ($scope.dateFound) {
          var req = {
            method: 'PATCH',
            url: 'https://api.servicemonster.net/v1/orders/' + $stateParams.orderID,
            headers: {
              'Authorization': "Basic ZTZleGc0Nkw6bUM0RHM5MXFnZXdPUzFv",
              'Content-Type': "application/json"
            },
            dataType: "PATCH",
            data: {
              note: $scope.noteForSM
            }
          }
          Utils.hide()
          $http(req).success(function () {
          }).error(function (error) {
            console.log(error)
            Utils.hide();
          });
        }
      },
      success: function (json) {
        $scope.noteForSM = generateSMNote();

        $scope.dateFound = true;
        var nameArray = [];
        for (var i = 0; i < json.length; i++) {
          nameArray.push(json[i].item.accountName)
        }
        var newChildRef = new Firebase(FURL + 'jobs/');
        newChildRef.once("value", function (snapshot) {
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key();
            var childData = childSnapshot.val();

            if ($stateParams.id == childData.orderNumber) {
              if (nameArray.indexOf(childData.accountName) > -1) {
                var newChildRef2 = new Firebase(FURL + 'jobs/' + key);
                newChildRef2.update({
                  "completed": true,
                  "deliveryDate": $scope.deliveryDate,
                  "deliveryNotes": $scope.deliveryNotes
                });
              } else {
                alert('Cannot find a deliver for that person in servicemonster on that day')
                //TODO holy hell change me back
                return;
                $scope.dateFound = false;
              }
            }

          });
          Utils.hide();
          $timeout(function () {
            $location.path("/home");
            console.log($location.path());
            return;
          });
        });

        // $scope.getJob($stateParams.id)
        Utils.show();

      }

    });


  }
  function generateSMNote (){
    var newChildRef = new Firebase(FURL + 'contactEvents/');
    newChildRef.once("value", function(snapshot) {
      // The callback function will get called twice, once for "fred" and once for "barney"
      snapshot.forEach(function(childSnapshot) {

        // key will be "fred" the first time and "barney" the second time
        var key = childSnapshot.key();
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();

      console.log('cd ' + childData);
      });
  })};
//   function generateSMNote (){
//     var newChildRef = new Firebase(FURL + 'contactEvents/');
//     console.log('spid ' + $stateParams.id);
//     var discList = "";
//     var discArray = []
//
//     newChildRef.orderByChild("jobOrderNumber").equalTo($stateParams.id).on("value", function(snapshot) {
//
//       )}
//
//       }
// }
});
