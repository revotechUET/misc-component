var componentName = 'wiDialog';

module.exports.name = componentName;

require('./style.less');

var app = angular.module(componentName, ['ngDialog']);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiDialogController,
    controllerAs: 'self',
    bindings: {
        templateId: '@',
        getlabel: '<',
        onDoneFn: '<',
        onCancelFn: '<',
        onApplyFn: '<'
    },
    transclude: true
});

function wiDialogController(ngDialog) {
   this.$onInit = function(){
       console.log("onInit");

   }
   this.onDoneClick = function(){
       onDoneFn();
       ngDialog.close();
   }
}