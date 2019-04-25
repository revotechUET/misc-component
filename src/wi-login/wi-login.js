var componentName = 'wiLogin';
module.exports.name = componentName;
require('./wi-login.less');
var wiToken = require('../wi-token');
var app = angular.module(componentName, ['ngDialog', wiToken.name]);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiLoginController,
    controllerAs: 'self',
    bindings: {
        name: '@',
        password: '@',
        whoami: '@',
        registerUrl: '@',
        appName: '@'
    }
});

function wiLoginController($http, $scope, ngDialog, wiToken) {
    let self = this;
    this.onLoginClick = function () {
        if (wiToken.getToken()) {
            wiToken.setToken(null);
            this.showDialogWarningLogout();
        } else {
            this.showDialogLogin();
        }
    }
    this.showDialogWarningLogout = function () {
        ngDialog.open({
            template: 'templateWarningLogout',
            className: 'ngdialog-theme-default',
            scope: $scope,
        });
    }
    this.showDialogLogout = function () {
        ngDialog.open({
            template: 'templateLogout',
            className: 'ngdialog-theme-default',
            scope: $scope,
        });
        wiToken.removeToken();
        setTimeout(function () {
            ngDialog.close();
        }, 1200);
        setTimeout(function () {
            location.reload();
        }, 1200);
    }
    this.showDialogLogin = function () {
        ngDialog.open({
            template: 'templateLogin',
            className: 'ngdialog-theme-default',
            scope: $scope,
        });
    }
    this.acceptLogout = function () {
        this.showDialogLogout();
    }
    this.getName = function () {
        return wiToken.getUserName();
    }
    this.isLogin = function () {
        return wiToken.getToken();
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
                    password: this.password,
                    whoami: self.whoami
                },
                headers: {}

            }).then(function (response) {
                if (response.data.code == 200) {
                    status = "online";
                    wiToken.setToken(response.data.content.token);
                    wiToken.saveToken(response.data.content)
                    ngDialog.close();
                    ngDialog.open({
                        template: 'templateDone',
                        className: 'ngdialog-theme-default',
                        scope: $scope,
                    });
                    setTimeout(function () {
                        ngDialog.close();
                    }, 1100);
                } else if (response.data.code == 512) {
                    console.error("512");
                }
            }, function (errorResponse) {
                console.error(errorResponse);
            });
        }
    }
}