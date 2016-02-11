'Use Strict';
angular.module('App').controller('loginController', function ($scope, $rootScope, $state, $cordovaOauth, $localStorage, $location,
                                                              $http, $ionicPopup, $firebaseObject, Auth, Utils) {
  var FURL = $rootScope.FURL;
  console.log('a ');
  if (!FURL) {
    if (location.host.toString().indexOf('localhost') > -1) {
      console.log('Setting local database');
      var FURL = 'https://cfbuilder.firebaseio.com/';
    } else {
      console.log('Setting remote database');

      var FURL = 'https://cctools.firebaseio.com/';
    }
  }
  console.log('b ');
  var ref = new Firebase(FURL);

  var userkey = "";
  console.log($rootScope.FURL);
  $scope.signIn = function (user) {
    console.log("Welcome");
    if (angular.isDefined(user)) {
      console.log('w2');
      Utils.show();
      Auth.login(user)
        .then(function (authData) {
          console.log("id del usuario:" + JSON.stringify(authData));

          ref.child('profile').orderByChild("id").equalTo(authData.uid).on("child_added", function (snapshot) {
            console.log(snapshot.key());
            userkey = snapshot.key();
            var obj = $firebaseObject(ref.child('profile').child(userkey));

            obj.$loaded()
              .then(function (data) {
                console.log(data === obj); // true
                //console.log(obj.email);
                $localStorage.email = obj.email;
                $localStorage.userkey = userkey;

                Utils.hide();
                $state.go('home');
                console.log("Starter page", "Home");

              })
              .catch(function (error) {
                console.error("Error:", error);
              });
          });

        }, function (err) {
          Utils.hide();
          Utils.errMessage(err);
        });
    }
  };

});
