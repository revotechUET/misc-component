var componentName = 'wiLogin';

module.exports.name = componentName;

require('./wi-login.less');

var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiLoginController,
    controllerAs: 'self',
    bindings: {}
});

function wiLoginController($http, $scope, ngDialog) {

    $scope.getInfor = function () {
        if ($scope.name === undefined || $scope.password === undefined) {
            ngDialog.open({
                template: 'templateNoti',
                className: 'ngdialog-theme-default',
                scope: $scope,
            });
        } else {
            $http({
                method: 'POST',
                url: 'http://admin.dev.i2g.cloud/login',
                data: {
                    username: $scope.name,
                    password: $scope.password
                },
                headers: {}
            }).then(function (response) {
                if (response.data.code == 200) {
                    window.alert("token: " + response.data.content.token);
                } else if (response.data.code == 512) {
                    ngDialog.open({
                        template: 'templateNoti',
                        className: 'ngdialog-theme-default',
                        scope: $scope,
                    });
                }
            }, function (errorResponse) {
                console.error(errorResponse);
            });
        }
    }
}


// app.factory("wiToken", function() {
//     return new TokenService();
// });

// function TokenService() {
//     this.token = null;
//     this.setToken = function(tokenVal) {
//         // token set
//     }
//     this.getToken = function() {

//     }
// }