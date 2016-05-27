'Use Strict';
angular.module('App').controller('rugEditController', function ($scope, $rootScope, $timeout, $window, $rootScope, $cordovaCamera, $stateParams, $state,
 $firebaseArray, $cordovaOauth, $localStorage, $location, $http, $ionicPopup, $firebaseObject, Auth, Utils) {
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
  $scope.key = $stateParams.rugKey;
  console.log($stateParams.rugKey);
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
    Utils.show();
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
    Utils.hide();
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
      if (!rug.length || !rug.width) {
        Utils.hide();
        alert('you need a length and a width');
        $window.location.assign('#/ruglist/?id=' + $stateParams.jobID + '&customer=' + $stateParams.customer);
        console.log($location.path());
        return;
      }
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
      });


    }
  } else {
    var ref = new Firebase(FURL + 'rugs');
    Utils.show();
    console.log('loading rug');
    ref.orderByChild("key").equalTo($stateParams.id).on("child_added", function (snapshot) {
      console.log(snapshot.key());
      var childData = snapshot.val();
      var milliseconds = Date.parse(childData.dueDate);
      childData.dueDate = new Date(milliseconds);

      $scope.rug = childData;
      Utils.hide();
    });

    $scope.addRug = function (rug) {
      if (rug.status !== 'PassedInspection') {
        rug.initials = '';
      }
      if (!rug.initials && rug.status == 'PassedInspection') {
        alert('Your initials are required.')
      }
      Utils.show();
      rug.orderNumber = $stateParams.jobID;
      rug.dueDate = rug.dueDate.toString();
      //rug.dueDate = new Date(rug.dueDate.toString());
      var newChildRef = new Firebase(FURL + 'rugs/' + rug.key);
      rug.contact = null;
      console.log('key ' + rug.key);
      newChildRef.set(rug);

      $scope.addAudit(rug);
      $timeout(function () {
        Utils.hide();
        $window.location.assign('#/ruglist/?id=' + $stateParams.jobID + '&customer=' + $stateParams.customer);
      });

    };

    $scope.deleteRug = function (rug) {
      var newChildRef = new Firebase(FURL + 'rugs/' + rug.key);
      newChildRef.update({ "deleted": true });
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
    if (!disc) {
      disc = "none";
    }
    contact.value = disc;

    contact.person = $localStorage.email;
    contact.customer = $scope.customer;
    var date = new Date();
    contact.time = date.toString();
    contact.rugKey = $scope.rug.key;
    console.log('here ' + $stateParams.jobID);
    contact.jobOrderNumber = $stateParams.jobID;
    console.table(contact);
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
  $scope.imageList = [];
  $scope.showImagesChange = function () {
    $scope.showImages ^= true;
    Utils.show();
    // document.getElementById("file-upload").addEventListener('change', saveimage, false);

    //TODO this loads every single freaking image and needs to be changed!
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
        console.log('number ' + $scope.imageList.length);
        document.getElementById("profileImage" + $scope.imageList.length).src = childData.image;
        $scope.imageList.push(childData);
        console.log('a ' + $scope.imageList.length);

        imgur.upload(childData).then(function then(model) {
          console.log('Your adorable cat be here: ' + model.link);
        });
        // }

        // }
      });
      console.log('a ' + $scope.imageList.length);

      Utils.hide();

    })
  };


  $scope.saveImage = function (e1) {

    var firebase = new Firebase(FURL);

    var storageRef = firebase.storage().ref();

    // File or Blob named mountains.jpg
    var fileName = e1.files[0];
    var fr = new FileReader();
    fr.onload = function (res) {
      $scope.image = res.target.result;
      var file = res.target.result;
      // ImgObj.image = res.target.result;
      // ImgObj.$save().then(function (val) {
      // }, function (error) {
      //   console.log("ERROR", error);
      // })
    };
    fr.readAsDataURL(filename);
    // Create the file metadata
    var metadata = {
      contentType: 'image/jpeg',
      rugKey: fileName,
      name: 'test'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child('images2/' + file.name).put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function (snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function (error) {
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;

          case 'storage/canceled':
            // User canceled the upload
            break;


          case 'storage/unknown':
      // Unknown error occurred, inspect error.serverResponse
      break;
  }
}, function () {
  // Upload completed successfully, now we can get the download URL
  var downloadURL = uploadTask.snapshot.downloadURL;
  console.log(downloadURL);
});





// console.log('b ' + $scope.imageList.length);
// var refImg = new Firebase(FURL + '/images/' + $stateParams.id + '/' + $scope.imageList.length);
// var ImgObj = $firebaseObject(refImg);
// console.log('svaing');
// var filename = e1.files[0];
// var fr = new FileReader();
// fr.onload = function (res) {
//   $scope.image = res.target.result;
//   ImgObj.image = res.target.result;
//   ImgObj.$save().then(function (val) {
//   }, function (error) {
//     console.log("ERROR", error);
//   })
// };
// fr.readAsDataURL(filename);
// $timeout(function () {
//   console.log('new rug added tranfering now ');
//   Utils.hide();
//   //TODO fix me adn dont send to home
//   $window.location.assign('#/ruglist/?id=' + $stateParams.jobID + '&customer=' + $stateParams.customer);
//   //$window.location.assign('/home');
//   console.log($location.path());
// });
    }


  }
);
