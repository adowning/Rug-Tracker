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
      if (!rug.initials) {
        rug.initials = 'none';
      }
      try {
        audit.intials = rug.initials;
        console.log('set equals ' + audit.initials);
      }
      catch (err) {
        console.log('no iontials ');
        audit.intials = 'none';
      }
      console.log('inti ' + audit.initials);
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
        console.log('spji ' + $stateParams.jobID);
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
        $scope.addDiscussion(rug.contact);
        $timeout(function () {
          console.log('new rug added tranfering now ');
          Utils.hide();
          //TODO fix me adn dont send to home
          $window.location.assign('#/ruglist/?id=' + $stateParams.jobID + '&customer=' + $stateParams.customer);
          //$window.location.assign('/home');
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
          $window.location.assign('#/ruglist/?id=' + $stateParams.jobID + '&customer=' + $stateParams.customer);


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

    //
    //IMAGES
    //

  $scope.showImages = false;

    $scope.showImagesChange = function () {
      $scope.showImages ^= true;
      Utils.show();
      // document.getElementById("file-upload").addEventListener('change', saveimage, false);

      var ref = new Firebase(FURL + '/images/');
      $scope.imageList = [];
      ref.once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          var key = childSnapshot.key();
          var childData = childSnapshot.val();
          console.log(key);
          // console.log('image ' + childData.image);
          // if ($stateParams.id == key) {
          if (key.toString().indexOf($scope.rug.key) > -1) {
            var number = key.substr(key.length - 1);
            console.log('number ' + number);
            document.getElementById("profileImage" + number).src = childData.image;
            $scope.imageList.push(childData);

          }

          // }
        })
        Utils.hide();

      })
    };


    $scope.loadimage = function () {
      console.log(imageList.length);
      // for (i = 0; i < imageList.length; i++) {
      //     var refImg = new Firebase(FURL + '/images/' + $stateParams.id + i);
      //   var ImgObj = $firebaseObject(refImg);
      //     ImgObj.$loaded().then(function (obj) {
      //       // $scope.profileImage = obj.image;
      //       console.log("loaded" + obj);
      //       document.getElementById("profileImage" + i).src = obj.image;
      //     }, function (error) {
      //       console.log("ERROR", error);
      //     }).bind(null, i);
      //   // asycronouseProcess(function (i) {
      //   //   alert(i);
      //   // }.bind(null, i));
      // }
      // for (var x = 0; x < imageList.length; x++) {
      //   console.log(x);
      //   var refImg = new Firebase(FURL + '/images/' + $stateParams.id + x);
      //   var ImgObj = $firebaseObject(refImg);
      //   ImgObj.$loaded().then(function (obj) {
      //     $scope.profileImage = obj.image;
      //     console.log("loaded" + x);
      //     document.getElementById("profileImage" + x).src = obj.image;
      //   }, function (error) {
      //     console.log("ERROR", error);
      //   });
      // }
    };
    // $scope.loadimage();
    // });


    $scope.saveImage = function (e1) {
      console.log('asdf ');
      var refImg = new Firebase(FURL + '/images/' + $stateParams.id + $scope.imageList.length);
      var ImgObj = $firebaseObject(refImg);
      console.log('svaing');
      var filename = e1.files[0];
      var fr = new FileReader();
      fr.onload = function (res) {
        $scope.image = res.target.result;
        ImgObj.image = res.target.result;
        ImgObj.$save().then(function (val) {
        }, function (error) {
          console.log("ERROR", error);
        })
      };
      fr.readAsDataURL(filename);
      $timeout(function () {
        console.log('new rug added tranfering now ');
        Utils.hide();
        //TODO fix me adn dont send to home
        $window.location.assign('#/ruglist/?id=' + $stateParams.jobID + '&customer=' + $stateParams.customer);
        //$window.location.assign('/home');
        console.log($location.path());
      });
    }



  }
);
