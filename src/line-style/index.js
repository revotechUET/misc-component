const moduleName = "line-style";
const componentName = "lineStyle";
module.exports.name = moduleName;

var module = angular.module(moduleName, ['wiDialog']);
module.component(componentName, {
    template: require('./template.html'),
    controller: LineStyleController,
    style: require('./style.css'),
    controllerAs: 'self',
    bindings:{
		bindLineStyle: '<'
    }
});
LineStyleController = ['$scope', '$element', '$timeout', 'wiDialog'];
function LineStyleController($scope, $element, $timeout, wiDialog) {
    let self = this;
    this.$onInit = function() {
		self.bindLineStyle = self.bindLineStyle || {
			lineColor: "red",
			lineWidth: 2,
			lineStyle: [10, 2]
		}
    }
	this.clicked = function(bindLineStyle) {
		wiDialog.lineStyleDialog(bindLineStyle, lineStyle => {
			self.bindLineStyle = lineStyle;
		})
	}
}
