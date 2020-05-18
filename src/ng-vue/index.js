import Vue from 'vue';
const moduleName = 'ngVue';
const module = angular.module(moduleName, [])
module.directive('vueComponent', function () {
    return {
        scope: {
            root: '<',
            props: '<',
        },
        link: function ($scope, $element, $attrs, $ctrl) {
            const vm = new Vue({
                el: $element[0],
                render: function (createElement) {
                    return createElement($scope.root, { props: $scope.props });
                }
            });
            $scope.$watch('props', function () {
                vm.$forceUpdate();
            });
        }
    }
});
module.component('vueContainer', {
    controller: Controller,
    bindings: {
        vueData: "<",
        vueMethods: "<",
        vueComponents: "<"
    },
    transclude: true,
});
Controller.$inject = ['$transclude', '$element'];
function Controller($transclude, $element) {
    this.$onInit = function () {
        $transclude((transcludedContent) => {
            const vueElem = Array.from(transcludedContent).find(e => e.nodeType === 1)
            new Vue({
                el: $element[0],
                template: vueElem.outerHTML,
                data: this.vueData,
                methods: this.vueMethods,
                components: this.vueComponents
            });
        })
    }
}

export default moduleName;