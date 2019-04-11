const moduleName = "katexView";
const componentName = "katexView";
module.exports.name = moduleName;

var module = angular.module(moduleName, []);
module.component(componentName, {
    template: require('./template.html'),
    controller: KatexViewController,
    style: require('./style.css'),
    controllerAs: 'self',
    bindings:{
        latexContent: "<"
    }
});

function KatexViewController($scope, $element, $timeout) {
    let self = this;
    this.$onInit = function() {
        $scope.$watch(function() {
            return self.latexContent;
        }, showEquation);
    }
    function showEquation() {
        let html = katex.renderToString(self.latexContent,{displayMode: false});
        $element.find('.latex').empty().append(html);
    }
}
