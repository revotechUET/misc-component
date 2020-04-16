var serviceName = 'wiSession';
export const name = serviceName;

let app = angular.module(serviceName, []);
app.factory(serviceName, function () {
    return new SessionStorageService();
});

function SessionStorageService() {
    let self = this;
    this.putData = function(key, value){
        window.sessionStorage.setItem(key, value);
    }
    this.getData = function(key){
        return window.sessionStorage.getItem(key);
    }
}
