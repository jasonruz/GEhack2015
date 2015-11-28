angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $ionicLoading) {
  $scope.mapCreated = function(map) {
    $scope.map = map;
    $scope.centerOnMe();
  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) { return; }  // if map not ready yet

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Got pos', pos);
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();

      // TODO: remove these phoney markers close to current location after the hackathon
      dropIncidentMarkers(pos);
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });

    function dropIncidentMarkers(pos) {
      // Drop a bunch of "critical incident" markers, so the user
      // can see where the problems are relative to their known position
      // these are just hacked for the hackathon, so TODO this function should be removed in production
      console.log('Dropping markers');

      var you_are_here = new google.maps.Marker({
        position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        map: $scope.map,
        icon: 'img/man.png',
        title: 'You are here'
      });

      var hazards = [
        { lat: 0.001, lng: 0.003, description: 'car crash' },
        { lat: -0.001, lng: 0, description: 'building fire' },
        { lat: 0.003, lng: -0.005, description: 'shooting' },
        { lat: 0.0, lng: 0.006, description: 'chemical spill' }
      ];

      for (var i = 0; i < hazards.length; i++) {
        var hazard = hazards[i];

        console.log(hazard);

        var infoWindow = new google.maps.InfoWindow({
          content: hazard.description
        });

        var marker = new google.maps.Marker({
          position: { lat: pos.coords.latitude + hazard.lat, lng: pos.coords.longitude  + hazard.lng },
          map: $scope.map,
          icon: 'img/hazard.png',
          title: 'Bad stuff happening'
        });

        marker.addListener('click', function() {
          console.log(marker);
          infoWindow.open($scope.map, marker);
        });
      }
    }
  };
});
