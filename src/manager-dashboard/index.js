const componentName = "managerDashboard";
module.exports = componentName;
//require('angular-drag-and-drop-lists');
require('../chart-widget');
var app = angular.module('managerDashboard', ['chartWidget', 'dndLists']);
app.component(componentName, {
    template: require("./template.html"),
    controllerAs: "self",
    controller: ManagerDashboardController,
    style: require("./style.less"),
    bindings : {
        dashboardColumns: "<",
        dashboardContent: "<"
    }
});

//const Macy = require('macy');
function ManagerDashboardController($scope, $element) {
    let self = this;
    let macyInst;
    this.relayout = _.debounce(function() {
        macyInst.reInit();
    }, 1000);
    this.$onInit = function() {
        let macyContainer = $element.children()[0];
        $scope.$on('chart-create', function() {
            self.relayout();
        });
        macyInst = Macy({
            container: macyContainer,
            columns: self.dashboardColumns || 4,
            trueOrder: true,
            margin: 10
        });
    }
    this.getLabels = function(widgetConfig) {
        widgetConfig.labels = widgetConfig.labels || [];
        widgetConfig.data.forEach(function(datum, idx) {
            widgetConfig.labels[idx] = widgetConfig.labelFn(widgetConfig, datum, idx);
        });
        return widgetConfig.labels;
    }
    this.getColors = function(widgetConfig) {
        widgetConfig.colors = widgetConfig.colors || [];
        widgetConfig.data.forEach(function(datum, idx) {
            widgetConfig.colors[idx] = widgetConfig.colorFn(widgetConfig, datum, idx);
        });
        return widgetConfig.colors;
    }
    
}
