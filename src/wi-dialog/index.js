var componentName = 'wiDialog';

module.exports.name = componentName;

require('./style.less');

var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiDialogController,
    controllerAs: 'self',
    bindings: {
     
    },
    transclude: true
});

function wiDialogController() {
   
}