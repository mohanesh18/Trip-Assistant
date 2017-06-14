
var signInWithPopup = function(){
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
   var token = result.credential.accessToken;
   var name, email, photoUrl, uid, emailVerified;
   firebase.auth().onAuthStateChanged(user => {
     if (user != null) {
       name = user.displayName;
       email = user.email;
       photoUrl = user.photoURL;
       emailVerified = user.emailVerified;
       uid = user.uid;
     }
     window.userData = user;
   })

 }).catch(function(error) {
   var errorCode = error.code;
   var errorMessage = error.message;
   var email = error.email;
   var credential = error.credential;
 });
} // Google SigninWithPopup

var signInWithRedirect = function(){
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
  firebase.auth().getRedirectResult().then(function(result) {
    //window.location.assign(getWidgetUrl())
    if (result.credential) {
      var token = result.credential.accessToken;
    }
    var user = result.user;
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
  });
}

var signOut = function(){
  firebase.auth().signOut().then(function() {
  }).catch(function(error) {
  });
};

var saveData = function(){
  var data = window.userData;
  var database = firebase.database();

  firebase.database().ref('users/' + data.uid).set({
    name: data.displayName,
    email: data.email,
    profile_picture : data.photoURL
  });
  showCityMap();

} // Firebase Database

var showCityMap = function(){ // Geocoder and getDetails
  var geocoder = new google.maps.Geocoder();
  var address = "Chennai";

  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK){
      let place_id = results[0].place_id;
      let lat = results[0].geometry.location.lat();
      let long = results[0].geometry.location.lng();
        var map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(lat, long),
        zoom: 15
    });

    var service = new google.maps.places.PlacesService(map);

    service.getDetails({
        placeId: place_id
    }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            //console.log(place, place.photos);
            var photoObj = place.photos[0];
            var url = photoObj.getUrl({'maxWidth': photoObj.width, 'maxHeight': photoObj.height});
            console.info(url)
            // for(var i =0; i< place.photos.length; i++){
            //   console.info(place.photos[i].getUrl({'maxWidth': 35, 'maxHeight': 35}));
            // }
            // Create marker
          var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });
            // Center map on place location
            map.setCenter(place.geometry.location);
        }
    });
    }
  });
}

var showCityStores = function(){  // nearbySearch
  var geocoder = new google.maps.Geocoder();
  var address = "Madurai";
  var infowindow;

  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK){
      let place_id = results[0].place_id;
      let lat = results[0].geometry.location.lat();
      let long = results[0].geometry.location.lng();
      let locationObj = new google.maps.LatLng(lat, long);
      console.info(locationObj, "locationObj");
      var map = new google.maps.Map(document.getElementById('map'), {
        center: locationObj,
        zoom: 15
    });
      var req = {
          location: locationObj,
          radius: '5000',
          types: ['car_repair']
      }
    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(req, callback);

    var map;
    var service;
    var infowindow;

    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          console.info(place);
          createMarker(results[i]);
        }
      }
    }
    function createMarker(place) {
      var placeLoc = place.geometry.location;
      var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
      });
    }

    }
  });

}

var showCitiesRoute = function(){ //DirectionsService and route
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();

  var myOptions = {
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  var map = new google.maps.Map(document.getElementById("map"), myOptions);
  directionsDisplay.setMap(map);

  var request = {
      origin: 'Chennai',
      destination: 'Madurai',
      travelMode: google.maps.DirectionsTravelMode.DRIVING
  };

  directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {

          console.info(response.routes[0].legs[0].distance.value + " meters");

          // Display the duration:
          console.info(response.routes[0].legs[0].duration.value + " seconds");

          directionsDisplay.setDirections(response);
      }
  });
}

var httpGetAsync = function (theUrl, callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}



var initApp = function(){
  //document.getElementById('btnLogin').addEventListener('click', signInWithRedirect);
  document.getElementById('btnLogin').addEventListener('click', signInWithPopup);
  document.getElementById('btnLogout').addEventListener('click', signOut);
  document.getElementById('btnSavedata').addEventListener('click', saveData);
  document.getElementById('btnshowMap').addEventListener('click', showCityMap);
  document.getElementById('btnshowStores').addEventListener('click', showCityStores);
  document.getElementById('btnshowRoute').addEventListener('click', showCitiesRoute);

}

window.addEventListener('load', initApp);
