angular.module('starter.controllers', ['ngResource'])

.controller('MapCtrl', function($scope, $ionicLoading, $resource, $timeout) {
  var markers = [],  // memoised markers
      phoneNumbers = [
        { number: "1234",        name: 'Jason' },
        { number: "61431884676", name: 'Ronald' },
        { number: "61421757888", name: 'Vidit' },
        { number: "2222",        name: 'Richard' }
      ];

  $scope.mapCreated = function(map) {
    $scope.map = map;
    $scope.centerOnMe();

    var fromTime;
    getReplies();

    // Get replies from server
    function getReplies() {
      var Replies = $resource('http://hackapi-dev.elasticbeanstalk.com/api/Reply');
      var replies = Replies.query(function () {
        console.log(replies);
        parseReplies(replies);

        // Poll server
        fromTime = Date.now();
        $timeout(getReplies, 2000);
      });
    }

    function parseReplies(replies) {
      for (var i = 0; i < replies.length; i++) {
        var reply = replies[i];

        // Check if reply is new
        if (fromTime) {
          if (Date.parse(reply.Sent) < fromTime) {
            continue;
          }
        }

        console.log(reply);

        // Split text from format {lat},{long}
        if (reply.Text) {
          var coords = reply.Text.split(',');
          if (!isNaN(coords[0]) || !isNaN(coords[1])) {
            console.log('lat ' + coords[0] + ', long ' + coords[1]);

            var personName = nameFromPhoneNumber(reply.From);

            var someone = new google.maps.Marker({
              position: { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) },
              map: $scope.map,
              icon: 'img/man.png',
              title: personName + ' is here'
            });

            console.dir(someone);
            var infoWindow = createInfoWindow({content: personName});
            addClickListener(someone, infoWindow);
          } else {
            $scope.replyText = $scope.replyText + '\n' + reply.Text;
          }
        }
      }
    }

  };

  function nameFromPhoneNumber(phoneNumber) {
    var i,
      personName = 'Unknown',
      phoneDetail;

    if (isNaN(phoneNumber)) {
      console.log(phoneNumber + ' is not a phone number');
      return phoneNumber;  // already some kind of non-numeric identifier
    }

    // Map phone number to name
    for (i = 0; i < phoneNumbers.length; i++) {
      phoneDetail = phoneNumbers[i];

      if (phoneDetail.number = phoneNumber) {
        personName = phoneDetail.name;
        break;
      }
    }

    console.log('Phone number ' + phoneNumber + ' -> ' + personName);
    return personName;
  }

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

      //var you_are_here = new google.maps.Marker({
      //  position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      //  map: $scope.map,
      //  icon: 'img/man.png',
      //  title: 'You are here'
      //});
      //
      //markers.push(you_are_here);

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
            infoWindow = createInfoWindow({content: incident.description});

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
    }
  };


  function createInfoWindow(info) {
    return new google.maps.InfoWindow(info);
  }

  function addClickListener(marker, infoWindow) {
    //console.log('attaching click listener for ' + marker);

    marker.addListener('click', function() {
      console.log(marker);
      infoWindow.open($scope.map, marker);
    });
  }

});
