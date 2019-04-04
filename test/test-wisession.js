var app = angular.module('myApp', ["wiSession"]);
app.controller('myCtrl', function (wiSession) {
    // wiSession.putData("key","value");
    console.log(wiSession.getData("key"));
});