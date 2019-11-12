const componentName = 'chartWidget';
//require('angular-chart.js');
angular.module(componentName, ['chart.js', 'editable', 'wiDropdownList']).component(componentName, {
    template: require('./template.html'),
    style: require('./style.less'),
    controllerAs: 'self',
    controller: WidgetController,
    bindings: {
        widgetConfig: '<',
        widgetName: "<"
    }
});

function WidgetController($scope, $element, chartSettings) {
    let self = this;
    self.chartSettings = chartSettings;
    this.$onInit = function() {
    }
    this.getLabels = function(widgetConfig) {
        widgetConfig.labels = widgetConfig.labels || [];
        if (widgetConfig.labelFn) {
            widgetConfig.data.forEach(function(datum, idx) {
                widgetConfig.labels[idx] = widgetConfig.labelFn(widgetConfig, datum, idx);
            });
        }
        return widgetConfig.labels;
    }
    this.getColors = function(widgetConfig) {
        widgetConfig.colors = widgetConfig.colors || [];
        if (widgetConfig.colorFn) {
            widgetConfig.data.forEach(function(datum, idx) {
                widgetConfig.colors[idx] = widgetConfig.colorFn(widgetConfig, datum, idx);
            });
        }
        return widgetConfig.colors;
    }
    this.getSeries = function(widgetConfig) {
        widgetConfig.series = widgetConfig.series || [];
        if (widgetConfig.serieFn) {
            widgetConfig.data.forEach(function(datum, idx) {
                widgetConfig.series[idx] = widgetConfig.serieFn(widgetConfig, datum, idx);
            });
        }
        return widgetConfig.series;
    }
    const nullObj = {};
    this.getOptions = function(widgetConfig) {
        return widgetConfig.options || nullObj;
    }
}
