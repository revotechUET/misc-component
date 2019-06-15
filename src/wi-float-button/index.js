var componentName = 'wiFloatButton';
module.exports.name = componentName;
require('./style.less');
var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiFloatButtonController,
    controllerAs: 'self',
    bindings: {
        top:'<',
        bottom:'<',
        right:'<',
        left:'<'
    },
    transclude: true

});

function wiFloatButtonController($scope) {
    let self = this;
    self.listConfig = [
        "Alfreds ",
        "Berglunds ",
        "Centro  ",
        "Ernst "]
  
}
