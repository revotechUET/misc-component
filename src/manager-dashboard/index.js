const componentName = "managerDashboard";
module.exports = componentName;
//require('angular-drag-and-drop-lists');
require('../chart-widget');
require('../../bower_components/angular-ui-sortable/sortable')
var app = angular.module('managerDashboard', ['chartWidget', 'dndLists', 'wiDialog', 'ui.sortable']);
app.component(componentName, {
    template: require("./template.html"),
    controllerAs: "self",
    controller: ManagerDashboardController,
    style: require("./style.less"),
    bindings : {
        dashboardColumns: "<",
        dashboardContent: "<",
        removeConfirm: "<",
        onClickChart: "<"
    }
});

//const Macy = require('macy');
function ManagerDashboardController($scope, $element, wiDialog) {
    let self = this;
    /*
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
    */

    this.sortableOptions = {
        stop: function(event, ui) {
            console.log("drag stop");
            console.log(self.dashboardContent.map(c => c.title || c.name));
        },
        'ui-floating': true,
        start: function(event, ui) {
            ui.placeholder.height(ui.item.height());
        },
        placeholder: "sortable-placeholder",
        cursor: "grabbing"
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
    this.removeWidget = function(widgetConfig) {
			if (self.removeConfirm) {
				wiDialog.confirmDialog(
					"Delete Widget Confirmation",
					"Are you sure to delete this widget?",
					(yes) => {
						if (yes) {
              deleteFn();
						}
					}
        )
      } else {
        deleteFn();
      }
      function deleteFn() {
        const index = self.dashboardContent.findIndex(w => w.config == widgetConfig);
        if (index >= 0)
          self.dashboardContent.splice(index, 1);
      }
    }
    this.chartClick = function (points, evt, widgetConfig) {
        self.onClickChart && self.onClickChart(points, evt, widgetConfig);
    }
}
