
var map;
// Create a new blank array for all the listing markers.
var markers = [];
var dynamic_data = [];
function setDynamicData(data){
    dynamic_data.push(data);
    console.log("arary", dynamic_data)
}

function myMap() {

    var myOptions = {
        zoom: 13,
        center: {lat: 53.343793, lng: -6.254572},//centerMap,
        panControl: true, //enable pan Control
        zoomControl: true, //enable zoom control
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL //zoom control size
        },
        scaleControl: true, // enable scale control
        mapTypeControl: false
    };

    map = new google.maps.Map(document.getElementById("map-div"), myOptions);


    $.getJSON("/station/static", function (data) {
        $.getJSON("/station/dynamic", function (dyndata) {
           renderHTML(data, dyndata);
           map.setZoom(13)
        })
    }).fail(function (msg) {
        console.log('failed', msg);
    });


    function renderHTML(bikeObj, dynObj) {

        for (var i = 0; i < bikeObj.length; i++) {
            for(var j = 0; j < dynObj.length; j++){
                if(bikeObj[i].name == dynObj[j].name){
                    var availBikes = dynObj[j].available_bikes;
                    //console.log(dynObj[j].available_bikes)
                    var availBikeStands = dynObj[j].available_bike_stands;
                }
            }
            var lngPos = bikeObj[i].position_lng;
            var latPos = bikeObj[i].position_lat;
            // console.log(position);
            var title = bikeObj[i].name;
            var address = bikeObj[i].address;
            var station = bikeObj[i].number;
            var info = new google.maps.InfoWindow({content: '<p><b>Address: </b>' + address + '<br>' + '<b>Available Bikes:</b> ' + availBikes + '<br>' + '<b>Free Stands:</b> ' + availBikeStands + '</p>'});
            // Create a marker per location, and put into markers array.
            //you take the info from here and put into the comment box when you click the marker.

            var percentage10 = bikeObj[i].bike_stands * (10 / 100);
            var percentage30 = bikeObj[i].bike_stands * (30 / 100);
            var percentage50 = bikeObj[i].bike_stands * (50 / 100);
            var percentage80 = bikeObj[i].bike_stands * (80 / 100);

            //HEAT MAP CONDITIONS
            switch (true) {
                case(availBikes == '0'):
                    varIcon = '/static/images/nobikes.png';
                    break;
                case(availBikes < percentage10):
                    varIcon = '/static/images/marker1.png';
                    break;
                case(availBikes < percentage30):
                    varIcon = '/static/images/marker2.png';
                    break;
                case(availBikes < percentage50):
                    varIcon = '/static/images/marker3.png';
                    break;
                case(availBikes < percentage80):
                    varIcon = '/static/images/marker4.png';
                    break;
                default:
                    varIcon = '/static/images/marker5.png';
            }
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(latPos, lngPos),
                title: title,
                station: station,
                address: address,
                availBikes: availBikes,
                availBikeStands: availBikeStands,
                icon: varIcon,
                animation: google.maps.Animation.DROP,
                id: i,
                info: info
            });

            // Push the marker to our array of markers.
            google.maps.event.addListener(marker, 'mouseover', function() {
                this.info.open(map, this);
            });
            google.maps.event.addListener(marker, 'mouseout', function() {
                this.info.close();
            });

            markers.push(marker);
        }
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);

    }

    document.getElementById('location-button').addEventListener('click', showCurrentLocation);
    document.getElementById('show-listings').addEventListener('click', showListings);
    document.getElementById('hide-listings').addEventListener('click', hideListings);

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function showListings() {
    // console.log(markers[3].title);
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideListings() {
//    console.log('Goodbye')
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

//This function receives a station from the dropdown menu and zooms in on it
function zoomfocus(station) {
    console.log('Hello');
    //Checks what the current icon is for the station
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].icon == "/static/images/custom-marker-current.png") {
            markers[i].setIcon("/static/images/marker5.png");
        }
    }
    //takes in the station name as a variable, changes the map focus to the position and change the icon to the current icon
    for (var i = 0; i < markers.length; i++) {
        // console.log(markers[i].address)
        if (markers[i].address == station) {
            map.setZoom(17);
            map.panTo(markers[i].position);
            markers[i].setIcon("/static/current.png");
            markers[i].setIcon("/static/images/custom-marker-current.png");
        }
    }
}

function showCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setZoom(14);
            var currentMarker = new google.maps.Marker({
                position: new google.maps.LatLng(pos),
                icon: "/static/images/current.png",
                animation: google.maps.Animation.DROP
            });
            map.setCenter(pos);
            currentMarker.setMap(map);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

//This function Filters the dropdown menu for the search bar
function searchFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("search-box");
    filter = input.value.toUpperCase();
    ul = document.getElementById("dropdown-list");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}


//function getWeather(){
//    var api_key = '51a2aeb31f24d602a541c80f16dd31e5';
//    results.loadhtml('http://api.openweathermap.org/data/2.5/weather?q=Dublin,Ireland' + api_key);
//
//
//}

$(document).ready(function () {
        var api_key = '51a2aeb31f24d602a541c80f16dd31e5';
        var api_url = 'http://api.openweathermap.org/data/2.5/weather?q=Dublin,Ireland' + api_key;

        $.ajax({
          url : api_url,
          method : 'GET',
          success : function (data) {
            console.log(data);
            var temp = data.main.temp;
            var location = data.name;
            var desc = data.weather.description;

            $('#result').text(temp + '°' + location);
          }
        });
     }) else {
    alert('Your browser doesnt support geolocation. Sorry.');
  };