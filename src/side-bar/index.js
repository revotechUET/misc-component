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
        orientation: "@",
        collapsed: "<",
    },
    transclude: true
});

function sideBarController($element, $timeout, $scope) {
    let self = this;
    this.toggle = function (x) {
        $timeout(function () {
            self.myWidth = self.myWidth === 15 ? self.myDefaultWidth : 15;
        });
    }

    this.$onInit = function () {
        this.myWidth = this.collapsed ? 15 : this.myDefaultWidth;
        this.orientation = this.orientation || "e";
        $timeout(function () {
            $element.find('.side-bar').resizable({
                handles: self.orientation,
                animate: false,
                start: function (event, ui) {
                    ui.element.removeClass('animation-enable');
                },
                stop: function (event, ui) {
                    self.myWidth = ui.element.width();
                    ui.element.addClass('animation-enable');
                }
            });
        }, 300);
    }
    this.myStyle = function () {
        switch (this.orientation) {
            case "e":
                return {
                    float: 'left',
                    width: (self.myWidth + 'px')
                };
            case "w":
                return {
                    float: 'right',
                    width: (self.myWidth + 'px')
                };
        }
    }
    this.handlePosition = function () {
        switch (this.orientation) {
            case "e":
                return {
                    right: 0
                };
            case "w":
                return {
                    left: 0
                };
        }
    }
    this.handleOpacityClass = function () {
        if (this.myWidth > 20) {
            return "";
        } else {
            return "full-opacity";
        }
    }
}