var app = angular.module('myApp', ['mapView', 'sideBar', 'wi-base-treeview', 'wiLogin', 'ngDialog', 'wiToken']);
app.controller('myCtrl', function ($scope, $http, wiToken) {

    this.refesh = function () {
        var lat,
            lng,
            latX,
            lngY,
            x,
            y;
        var projectList = [];
        var wellSelect = [];
        var firstProjection = "+proj=utm +zone=49 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
        var secondProjection = "+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees";
        $scope.wells = [];
        //PROJECT LIST
        $http({
            method: 'POST',
            url: 'http://dev.i2g.cloud/project/list',
            data: {},
            headers: {
                "Authorization": wiToken.getToken(),
            }
        }).then(function (response) {
            for (let index = 0; index < response.data.content.length; index++) {
                projectList.push({
                    data: {
                        icon: "project-normal-16x16",
                        label: response.data.content[index].name,
                    }
                });
            }
            console.log(projectList);
        }, function (errorResponse) {
            console.error(errorResponse);
        });
        $scope.projectList = projectList;
        //WELLSELECT

        $http({
            method: 'POST',
            url: 'http://dev.i2g.cloud/project/fullinfo',
            data: {
                //GET ID PROJECT
                idProject: 3
            },
            headers: {
                "Authorization": wiToken.getToken(),
            }
        }).then(function (response) {
            for (let index = 0; index < response.data.content.wells.length; index++) {
                wellSelect.push({
                    data: {
                        icon: "well-16x16",
                        label: response.data.content.wells[index].name,
                    }
                });
                idWell = response.data.content.wells[index].idWell;
                //-----------------------------------------------
                $http({
                    method: 'POST',
                    url: 'http://dev.i2g.cloud/project/well/info',
                    data: {
                        idWell: idWell
                    },
                    headers: {
                        "Authorization": wiToken.getToken(),
                    }
                }).then(function (response) {

                    //FIND NAME WELL           
                    name = response.data.content.name;
                    lat = 0;
                    lng = 0;
                    x = 0;
                    y = 0;

                    //FIND AND FILLTER LATITUS ON RESPONSE DATA
                    for (let index = 0; index < response.data.content.well_headers.length; index++) {
                        if (response.data.content.well_headers[index].header ===
                            "LATI") {

                            // DMS TO DD
                            if (isNaN(response.data.content.well_headers[index]
                                    .value)) {
                                lat = ConvertDMSToDD(response.data.content
                                    .well_headers[index].value);
                                break;
                            }
                            // IF DD IS DEFAULT
                            lat = response.data.content.well_headers[index]
                                .value;

                            break;
                        }
                        continue;
                    }
                    //FIND AND FILLTER LONGTITUS ON RESPONSE DATA
                    for (let index = 0; index < response.data.content.well_headers.length; index++) {
                        if (response.data.content.well_headers[index].header ===
                            "LONG") {

                            // DMS TO DD
                            if (isNaN(response.data.content.well_headers[index]
                                    .value)) {
                                lng = ConvertDMSToDD(response.data.content
                                    .well_headers[index].value);
                                break;
                            }
                            // IF DD IS DEFAULT
                            lng = response.data.content.well_headers[index]
                                .value;
                            break;
                        }
                        continue;
                    }
                    //FIND AND FILLTER X
                    for (let index = 0; index < response.data.content.well_headers.length; index++) {
                        if (response.data.content.well_headers[index].header ===
                            "X") {
                            x = Number(response.data.content.well_headers[index]
                                .value);
                            break;
                        }
                        continue;
                    }
                    //FIND AND FILLTER Y
                    for (let index = 0; index < response.data.content.well_headers.length; index++) {
                        if (response.data.content.well_headers[index].header ===
                            "Y") {
                            y = Number(response.data.content.well_headers[index]
                                .value);
                            break;
                        }
                        continue;
                    }

                    //PUSH LATITUS AND LONGTITUS TO WELL ARRAY
                    // lat---0  lng---0    x---OK    y---OK
                    if (((lat == 0) || (lng == 0)) && ((x != 0) && (y != 0))) {
                        //CHANGE INFO INPUT
                        // console.log("Convert UTM to Latlong");

                        latX = proj4(firstProjection, secondProjection, [x, y])[
                            1];
                        lngY = proj4(firstProjection, secondProjection, [x, y])[
                            0];

                        $scope.wells.push({
                            name: name,
                            lat: latX,
                            lng: lngY,
                            log: "Convert UTM to Latlong"
                        });
                        // lat---OK  lng---OK    x---O    y---OK
                    } else if (((lat != 0) && (lng != 0))) {
                        // console.log("Lat and long is update");
                        $scope.wells.push({
                            name: name,
                            lat: Number(lat),
                            lng: Number(lng),
                            log: ""
                        });
                    } else {
                        // console.log("Latlong or XY is missing");
                        $scope.wells.push({
                            name: name,
                            lat: 0,
                            lng: 0,
                            log: "Latlong or XY is missing"
                        });
                    }
                }, function (errorResponse) {
                    console.error(errorResponse);
                });
                //-----------------------------------------------
                $scope.wellSelect = wellSelect;
            }
            console.log(response);
        }, function (errorResponse) {
            console.error(errorResponse);
        });
    }
    // setTimeout(function () {

    // }, 8000);

    //WELLLIST
    // $scope.wellList = [{
    //         "data": {
    //             "icon": "well-16x16",
    //             "label": "Project 13333",

    //         }
    //     },
    //     {
    //         "data": {
    //             "icon": "well-16x16",
    //             "label": "Project 13322233",

    //         },
    //     },
    //     {
    //         "data": {
    //             "icon": "well-16x16",
    //             "label": "Project 13322233",

    //         },
    //     }
    // ];


});

function ConvertDMSToDD(input) {
    let parts = input.split(/[^\d+(\,\d+)\d+(\.\d+)?\w]+/);
    let degrees = parseFloat(parts[0]);
    let minutes = parseFloat(parts[1]);
    let seconds = parseFloat(parts[2].replace(',', '.'));
    let direction = parts[3];
    let dd = degrees + minutes / 60 + seconds / (60 * 60);

    if (direction == 'S' || direction == 'South' || direction == 'W' || direction == 'West') {
        dd = dd * -1;
    }
    return dd;
}