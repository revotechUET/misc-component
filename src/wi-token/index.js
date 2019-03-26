var serviceName = 'wiToken';
var jwt = require('jsonwebtoken');
module.exports.name = serviceName;

let app = angular.module(serviceName,[]);
app.factory(serviceName, function() {
    return new TokenService();
});

function TokenService() {
    this.token = null;
    this.setToken = function(tokenVal) {
        this.token = tokenVal;
    }
    this.getUserName = function(){
        if( !this.token ){
            return "GUEST";
        }
        var decoded = jwt.decode(this.token);
        return decoded.username;
    }
    this.getCompany = function(){
        if( !this.token ){
            return "";
        }
        var decoded = jwt.decode(this.token);
        return decoded.company;
    }
    this.getToken = function() {
        return this.token;
    }
}