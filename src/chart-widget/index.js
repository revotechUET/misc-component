const componentName = 'chartWidget';
require('../../bower_components/chartjs-plugin-labels/build/chartjs-plugin-labels.min');
//require('angular-chart.js');
angular.module(componentName, ['chart.js', 'editable', 'wiDropdownList']).component(componentName, {
    template: require('./template.html'),
    style: require('./style.less'),
    controllerAs: 'self',
    controller: WidgetController,
    bindings: {
        widgetConfig: '<',
        widgetName: "<",
        showSetting: "<",
        removeFn: "<"
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
    const pie_chart_options = {
        plugins: {
            labels: [
                {
                    render: 'label',
                    position: 'outside'
                },
                {
                    render: 'value'
                }
            ]
        }
    }
    const bar_chart_options = {
        plugins: {
            labels: {
                render: 'value'
            }
        }
    }
    const drawNullFn = () => ""
    this.getOptions = function(widgetConfig) {
        switch (widgetConfig.type) {
            case 'bar': case 'horizontal-bar':
                if (widgetConfig.chart_options && widgetConfig.chart_options.showSegmentLabel) {
                    bar_chart_options.plugins.labels.render = 'value' 
                } else {
                    bar_chart_options.plugins.labels.render = drawNullFn 
                }
                return Object.assign(bar_chart_options, widgetConfig.bar_chart_options);
            case 'pie': case 'doughnut':
                if (widgetConfig.chart_options && widgetConfig.chart_options.showSegmentLabel) {
                    pie_chart_options.plugins.labels[0].render = 'label' 
                    pie_chart_options.plugins.labels[1].render = "value"
                } else {
                    pie_chart_options.plugins.labels[0].render = drawNullFn 
                    pie_chart_options.plugins.labels[1].render = drawNullFn 
                }
                return pie_chart_options;
            default:
                return nullObj;
        }
    }
    this.deleteChart = function() {
        self.removeFn && self.removeFn(self.widgetConfig);
    }
}
