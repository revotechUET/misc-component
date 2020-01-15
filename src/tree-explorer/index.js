const moduleName = "treeExplorer";
const componentName = "treeExplorer";
module.exports.name = moduleName;

var module = angular.module(moduleName, []);
module.component(componentName, {
    template: require('./template.html'),
    controller: TreeExplorerController,
    style: require('./style.less'),
    controllerAs: 'self',
    bindings: {
        listFolders: '<',
        dbClickFolder: '<',
        currentPath: '<',
        goToFolder: '<'
    }
});
function TreeExplorerController($scope, $element, $timeout) {
    let self = this;
    this.$onInit = function() {
        console.log(self.listFolders);
    }
}
