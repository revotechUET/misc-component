var componentName = 'sideBar';

module.exports.name = componentName;

require('./side-bar.css');

var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: sideBarController,
    controllerAs: 'self',
    bindings: {
        myDefaultWidth: "<",
        buttonVOffset:"<"
    },
    transclude: true
});

function sideBarController($element, $timeout, $scope) {
    let self = this;
    this.toggle = function(x) {
        $timeout(function() {
            self.myWidth = self.myWidth===0?self.myDefaultWidth:0;
        });
    }
  
    this.$onInit = function() {
        this.myWidth = this.myDefaultWidth;
        this.buttonVOffset = this.buttonVOffset || 30;
        $timeout(function() {
            $element.find('.side-bar').resizable({
                handles: "e",
                animate: false,
                start: function(event, ui) {
                    ui.element.removeClass('animation-enable');
                },
                stop: function(event, ui) {
                    self.myWidth = ui.element.width();
                    ui.element.addClass('animation-enable');
                }
            });
        }, 300);
    }
}
