// import angular from 'angular';
import Vue from 'vue';
import template from './template.html';
const moduleName = "vueContainer";
export const name = moduleName;
let app = angular.module(moduleName, [])
app.component(moduleName, {
    template,
    controller: Controller,
    bindings: {
        vueData: "<",
        vueMethods: "<",
        vueComponents: "<"
    }, 
    transclude: true
});
Controller.$inject = ['$transclude', '$element']
function Controller($transclude, $element) {
    let self = this;
    this.$onInit = function() {
        $transclude((transcludedContent) => {
            let vueElem; 
            for (let i =0; i < transcludedContent.length; i++) {
                if (transcludedContent[i].nodeType === 1) {
                    vueElem = transcludedContent[i]; break;
                }
            }
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