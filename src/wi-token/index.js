var serviceName = 'wiToken';

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
    this.getToken = function() {
        return this.token;
    }
}