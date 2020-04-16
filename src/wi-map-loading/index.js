var componentName = 'wiMapLoading';
export const name = componentName;
require('./style.less');
var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiMapLoadingController,
    controllerAs: 'self',
    bindings: {
        top:'<',
        bottom:'<',
        right:'<',
        left:'<'
    },
    transclude: true

});

function wiMapLoadingController() {
}
