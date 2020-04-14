var componentName = 'wiDroppable';
module.exports.name = componentName;
require('./style.less');
var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiDroppableController,
    controllerAs: 'self',
    bindings: {
        onDrop: '<',
        onOver: '<',
        onOut: '<',
        onDeactivate: '<',
        containerStyle: "<"
    },
    transclude: true
});
wiDroppableController.$inject = ['$scope', '$element'];
function wiDroppableController($scope, $element) {
    let self = this;
    this.$onInit = function () {
        $element.children().droppable({
            drop: function (event, ui) {
                self.onDrop && self.onDrop(event, ui.helper, ui.helper.myData);
            },
            over: function (event, ui) {
                $(this).addClass('drag-over');
                ui.helper.addClass();
                self.onOver && self.onOver(event, ui.helper, ui.helper.myData);
            },
            out: function (event, ui) {
                $(this).removeClass('drag-over');
                self.onOut && self.onOut(event, ui.helper, ui.helper.myData);
            },
            deactivate: function (event, ui) {
                $(this).removeClass('drag-over');
                self.onDeactivate && self.onDeactivate(event, ui.helper, ui.helper.myData);
            }
        });
    }
}
