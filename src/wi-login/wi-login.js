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
        appName: '@',
        loginUrl: '@',
        queryString: '<'
    }
});
wiLoginController.$inject = ['$http', '$scope', 'ngDialog', 'wiToken'];
function wiLoginController($http, $scope, ngDialog, wiToken) {
    let self = this;
    $scope.$watch(
        function () {
          return wiToken.getToken();
        },
        function (newValue, oldValue) {
          if(!newValue) self.showDialogLogin();
        }
    );
    this.$onInit = function (){
        self.loginUrl = self.loginUrl || 'http://admin.dev.i2g.cloud/login';
        if (self.queryString.token) {
            wiToken.setToken(self.queryString.token);
            wiToken.saveToken({ token: self.queryString.token });
        }
        if (!wiToken.getToken()) {
            this.showDialogLogin();
        }
    }

    this.onLoginClick = function () {
        if (wiToken.getToken()) {
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
            window.location.href = window.location.origin;
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
                // url: 'http://admin.dev.i2g.cloud/login',
                url: this.loginUrl,
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
                    wiToken.setPassword(self.password);
                    // console.log(self.password);
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
                    // console.error("512");
                    ngDialog.open({
                        template: 'templateLoginFailed',
                        className: 'ngdialog-theme-default',
                        scope: $scope,
                    });
                    self.acceptReLogin = function () {
                        ngDialog.close();
                        self.showDialogLogin();
                    }
                }
            }, function (errorResponse) {
                console.error(errorResponse);
            });
        }
    }
}