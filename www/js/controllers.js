angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $ionicLoading) {
  var markers = [];  // memoised markers

  $scope.mapCreated = function(map) {
    $scope.map = map;
    $scope.centerOnMe();
  };

  $scope.centerOnMe = function () {
    //console.log("Centering");

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
      //console.log('Dropping markers');

      clearExistingIncidentMarkers();

      var you_are_here = new google.maps.Marker({
        position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        map: $scope.map,
        icon: 'img/man.png',
        title: 'You are here'
      });

      markers.push(you_are_here);

      var hazards = [
        // icons are from https://mapicons.mapsmarker.com/category/markers/events/
        { lat: 0.001,  lng: 0.003,  summary: 'car crash',      icon: 'caraccident.png', description: '4WD crashed into a tree' },
        { lat: -0.001, lng: 0,      summary: 'building fire',  icon: 'fire.png',        description: 'Building on fire. Suspected arson' },
        { lat: 0.003,  lng: -0.005, summary: 'shooting',       icon: 'shooting.png',    description: 'Guy taking pot shots'     },
        { lat: 0.0,    lng: 0.006,  summary: 'chemical spill', icon: 'radiation.png',   description: 'Suspected terrorist with dirty bomb. Get out of there!' }
      ];

      for (var i = 0; i < hazards.length; i++) {
        var incident   = hazards[i],
            marker     = dropIncidentMarker(incident),
            infoWindow = createInfoWindow(incident);

        markers.push(marker);  // so we can delete them later
        addClickListener(marker, infoWindow);
      }

      function clearExistingIncidentMarkers() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }

        markers = [];
      }

      function dropIncidentMarker(incident) {
        //console.log('Adding marker for ' + incident);

        return new google.maps.Marker({
          position: {lat: pos.coords.latitude + incident.lat, lng: pos.coords.longitude + incident.lng},
          map: $scope.map,
          icon: 'img/' + incident.icon,
          title: incident.summary  // tooltip
        });
      }

      function createInfoWindow(incident) {
        //console.log('Adding infoWindow for ' + incident);
        return new google.maps.InfoWindow({content: incident.description});
      }

      function addClickListener(marker, infoWindow) {
        //console.log('attaching click listener for ' + marker);

        marker.addListener('click', function() {
          console.log(marker);
          infoWindow.open($scope.map, marker);
        });
      }

    }
  };
});
