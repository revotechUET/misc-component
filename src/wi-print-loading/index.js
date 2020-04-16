var componentName = 'wiPrintLoading';
export const name = componentName;
require('./style.less');
var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiPrintLoadingController,
    controllerAs: 'self',
    bindings: {
        top:'<',
        bottom:'<',
        right:'<',
        left:'<'
    },
    transclude: true

});

function wiPrintLoadingController() {
}
