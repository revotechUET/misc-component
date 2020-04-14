const componentName = 'chartWidget';
// load plugins if Chart class is presented and label plugin is not loaded yet
if (typeof Chart != "undefined" && !Chart.plugins.getAll().find(p => p.id == "labels"))
    require('../../bower_components/chartjs-plugin-labels/build/chartjs-plugin-labels.min');
//require('angular-chart.js');
angular.module(componentName, ['chart.js', 'editable', 'wiDropdownList', "wiApi"]).component(componentName, {
    template: require('./template.html'),
    style: require('./style.less'),
    controllerAs: 'self',
    controller: WidgetController,
    bindings: {
        widgetConfig: '<',
        widgetName: "<",
        showSetting: "<",
        removeFn: "<",
        chartClick: "<"
    }
});
WidgetController.$inject = ['$scope', '$element', 'chartSettings', 'wiApi'];
function WidgetController($scope, $element, chartSettings, wiApi) {
    let self = this;
    self.chartSettings = chartSettings;
    self.colorPalettes = (function() {
      let palTable = wiApi.getPalettes();
      let items = Object.keys(palTable).map(palName => {
        let data = {
          label: palName
        };
        let properties = {
          name: palName,
          palette: palTable[palName]
        };
        let toReturn = {data, properties};
        return toReturn;
      });
      items.unshift({
        data: {
          label: ""
        },
        properties: {
          name: '',
          palette: null
        }
      }) 
      return items;
    }());
  this.getColorPalette = function(widgetConfig) {
    return widgetConfig.paletteName || "";
  }
  this.setColorPalette = function(selectedProps, widgetConfig) {
    widgetConfig.paletteName = (selectedProps || {}).name || "";
  }
    this.$onInit = function() {
    }
    this.getLabels = function(widgetConfig) {
        // widgetConfig.labels = widgetConfig.labels || [];
        if (!widgetConfig.labels)
            widgetConfig.labels = []
        widgetConfig.labels.length = 0;
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
                return Object.assign(bar_chart_options, widgetConfig.chart_options || {}, widgetConfig.bar_chart_options);
            case 'pie': case 'doughnut':
                if (widgetConfig.chart_options && widgetConfig.chart_options.showSegmentLabel) {
                    pie_chart_options.plugins.labels[0].render = 'label' 
                    pie_chart_options.plugins.labels[1].render = "value"
                } else {
                    pie_chart_options.plugins.labels[0].render = drawNullFn 
                    pie_chart_options.plugins.labels[1].render = drawNullFn 
                }
                return Object.assign(pie_chart_options, widgetConfig.chart_options || {});
            default:
                return nullObj;
        }
    }
    this.deleteChart = function() {
        self.removeFn && self.removeFn(self.widgetConfig);
		}

		function palette2RGB(palette, semiTransparent) {
			if (!palette || !Object.keys(palette).length) return 'transparent';
			return `rgb(${palette.red},${palette.green},${palette.blue},${semiTransparent ? palette.alpha / 2 : 1})`
		}

    this.chartClickFn = function (points, evt) {
        self.chartClick && self.chartClick(points, evt, self.widgetConfig);
    }

    this.toggleFullScreen = function() {
        $element[0].parentElement.classList.toggle("full-screen");
        if (self.isFullScreen())
            $($element[0].parentElement.parentElement).sortable("disable");
        else
            $($element[0].parentElement.parentElement).sortable("enable");
    }

    this.isFullScreen = function() {
        return $element[0].parentElement.classList.contains("full-screen");
    }
}
