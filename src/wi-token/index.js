var serviceName = 'wiToken';
//var jwt = require('jsonwebtoken');
var jwt_decode = require('jwt-decode');
module.exports.name = serviceName;

let app = angular.module(serviceName, []);
app.factory(serviceName, function () {
    return new TokenService();
});

function TokenService() {
    this.token = null;
    this.setToken = function (tokenVal) {
        this.token = tokenVal;
    }
    this.getUserName = function () {
        if (this.token === undefined || (localStorage.getItem("token")) === null) {
            return "guest";
        }
        return localStorage.getItem("username");
    }
    this.getCompany = function () {
        if (!this.token) {
            return "";
        }
        //var decoded = jwt.decode(this.token);
        var decoded = jwt_decode(this.token);
        return decoded.company;
    }
    this.getToken = function () {
        if (localStorage.getItem("token")) {
            return localStorage.getItem("token");
        }
        return this.token;

    }
    this.saveToken = function (tokenVal) {
        var decoded = jwt_decode(this.token);
        localStorage.setItem('token', tokenVal.token);
        localStorage.setItem('refresh_token', tokenVal.refresh_token);
        localStorage.setItem('username', decoded.username);
    }
    this.removeToken = function () {
        localStorage.clear();
    }
}
