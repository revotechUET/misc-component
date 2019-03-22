var componentName = 'mapView';

module.exports.name = componentName;

require('./map-view.css');

var app = angular.module(componentName, []);

app.component(componentName, {
  template: require('./map-view.html'),
  controller: mapViewController,
  controllerAs: 'self',
  bindings: {
    wells: "<"
  },
  transclude: true
});

function mapViewController($element) {
  mapboxgl.accessToken = 'pk.eyJ1IjoiazU0aHVuZ3liIiwiYSI6ImNqdGZtNDE4ODF1OXEzeW85djJ5c29nYnoifQ.-VfHeKXV9avmbia1E7BFcQ';
  var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', //hosted style id
    center: [95.8390896, 21.0396225], // starting position
    zoom: 5, // starting zoom
    // pitch: 60, // pitch in degrees
    // bearing: 0, // bearing in degrees
  });

  new mapboxgl.Marker()
    .setLngLat([105.8090896, 21.0396225])
    .addTo(map);
  //SEARCH
  // map.addControl(new MapboxGeocoder({
  //   accessToken: mapboxgl.accessToken
  // }));
  //CONTROL
  // map.addControl(new mapboxgl.NavigationControl());
  //NAVIGATION
  // map.addControl(new MapboxDirections({
  //   accessToken: mapboxgl.accessToken
  // }), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }));
  map.addControl(new mapboxgl.FullscreenControl());



}



























// function mapViewController($element) {
//   let self = this;
//   // CENTER MAP
//   var options = {
//     center: [10.36, 108.48],
//     minZoom: 1,
//     zoom: 7
//   }

//   //SHOW MAP
//   var map = L.map('map', options);
//   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: '&copy;<a href="https://www.i2g.cloud/">i2G cloud</a>',
//   }).addTo(map);
//   // console.log("show map");

//   //SHOW WELL TO MAP
//   // this.$onInit = function() {
//   //   setTimeout ( function() {
//   //     console.log(self.wells);
//   //     for (var i = 0; i < self.wells.length; ++i) {
//   //       L.marker([self.wells[i].lat, self.wells[i].lng], {
//   //         draggable: false,
//   //       })
//   //       .bindPopup(self.wells[i].name)
//   //       .addTo(map);
//   //       // console.log(self.wells[i].name+" LAT: " + self.wells[i].lat +" LONG: "+ self.wells[i].lng);
//   //     }
//   //   }, 3000 );
//   // }

// }