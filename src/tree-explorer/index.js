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
        // listFolders: '<',
        dbClickFolder: '<',
        currentPath: '<',
        goToFolder: '<',
        fileList: "<",
        dbClickFile: "<",
        clickFile: "<",
        clickFolder: "<"
    }
});
function TreeExplorerController() {
    let self = this;
    this.$onInit = function() {
        console.log(self.listFolders);
    }
    this.clickNode = function(node) {
        if(node.rootIsFile) {
            return self.clickFile(node);
        }
        return self.clickFolder(node);
    }
    this.dbClickNode = function(node) {
        if(node.rootIsFile) {
            return self.dbClickFile(node);
        }
        return self.dbClickFolder(node);
    }

    this.itemSelected = null;
    this.selectItem = function(item) {
        self.itemSelected = item;
    }
    this.isSelected = function(item) {
        return [self.itemSelected].indexOf(item) != -1;
    }
    this.showIcon = function(item) {
        // console.log(item)
        if(!item.rootIsFile) {
            return "folder-icon-16x16";
        }else {
            return item.rootName.split(".").pop() == 'zip' ? "zip-icon-16x16" : "file-icon-16x16";
        }
    }
}
