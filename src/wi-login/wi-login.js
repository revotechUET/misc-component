var componentName = 'wiLogin';

module.exports.name = componentName;

require('./wi-login.less');
var wiToken = require('../wi-token');

var app = angular.module(componentName, [wiToken.name]);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiLoginController,
    controllerAs: 'self',
    bindings: {
        name: '@'
    }
});

function wiLoginController($http, $scope, ngDialog, wiToken) {
    var status = "offline";
    this.showDialog = function () {
        ngDialog.open({
            template: 'templateTest',
            className: 'ngdialog-theme-default',
            scope: $scope,
        });
    }
    this.getInfor = function () {
        if (this.name === undefined || this.password === undefined) {
            console.error("error");
        } else {
            $http({
                method: 'POST',
                url: 'http://admin.dev.i2g.cloud/login',
                data: {
                    username: this.name,
                    password: this.password
                },
                headers: {}
                
            }).then(function (response) {
                if (response.data.code == 200) {
                    console.log(response.data.content.token);
                    status = "online";
                    wiToken.setToken(response.data.content.token);
                    ngDialog.close();
                    ngDialog.open({
                        template: 'templateDone',
                        className: 'ngdialog-theme-default',
                        scope: $scope,
                    });
                    setTimeout(function () {
                        ngDialog.close();
                    }, 2000);
                    $http({
                        method: 'POST',
                        url: 'http://dev.i2g.cloud/project/list',
                        data: {
                        },
                        headers: {
                            "Authorization": wiToken.getToken(),
                        }
                    }).then(function (response) {
                        console.log(response);
                     
                    }, function (errorResponse) {
                        console.error(errorResponse);
                    });
                } else if (response.data.code == 512) {
                    console.error("512");
                }
            }, function (errorResponse) {
                console.error(errorResponse);
            });
        }
    }
    this.isOnline = function () {
        if (status == "online") {
            return "online";
        }
        return "offline"

    }
}