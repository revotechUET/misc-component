import katex from 'katex';

const moduleName = "katexView";
const componentName = "katexView";
export const name = moduleName;

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
KatexViewController.$inject = ['$scope', '$element', '$timeout'];
function KatexViewController($scope, $element, $timeout) {
    let self = this;
    this.$onInit = function() {
        $scope.$watch(function() {
            return self.latexContent;
        }, showEquation);
    }
    function showEquation() {
        let html = katex.renderToString(self.latexContent,{displayMode: false, throwOnError: false});
        $element.find('.latex').empty().append(html);
    }
}
