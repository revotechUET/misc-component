var componentName = 'wiTreeView';
module.exports.name = componentName;

require('./style.less');

var app = angular.module(componentName, []);
app.component('wiTreeNode', {
    template: require('./template-node.html'),
    controller: wiTreeNodeController,
    controllerAs: 'self',
    bindings: {
        treeRoot: "<",
        filter: "<",
        getChildren: "<",
        getLabel: "<",
        getIcon: "<",
        keepChildren: "<",
        runMatch: "<",
        clickFn: "<",
        collapsed: "<"
    },
    require: {
        wiTreeView: "^^wiTreeView"
    }
});
app.component(componentName, {
    template: require('./template.html'),
    controller: wiTreeViewController,
    controllerAs: 'self',
    bindings: {
        treeRoot: "<",
        filter: "<",
        keepChildren: "<",
        getChildren: "<",
        getLabel: "<",
        getIcon: "<",
        runMatch: "<",
        clickFn: "<",
        collapsed: "<"
    },
    transclude: true
});
function wiTreeViewController($element, $timeout, $scope) {
    let self = this;
    if (!window.wiTreeCtrl)
        window.wiTreeCtrl = this;
    this.$onInit = function () {
        console.log(self.treeRoot);
    }
    this.collapseAll = function() {
        $scope.$broadcast('collapsed-command', true);
    }
    this.expandAll = function() {
        $scope.$broadcast('collapsed-command', false);
    }
    this.deselectAllExcept = function(nodeController) {
        $scope.$broadcast('deselect-command', nodeController);
    }
}
function wiTreeNodeController($element, $timeout, $scope) {
    let self = this;
    this.showNode = function() {
        let matched = self.runMatch(self.treeRoot, self.filter);
        self.filter1 = (matched && self.keepChildren) ? '' : self.filter;
        return matched;
    }
    this.$onInit = function () {
        $scope.$on('collapsed-command', function($event, collapsed) {
            $timeout(() => {self.collapsed = collapsed});
        });
        $scope.$on('deselect-command', function($event, nodeController) {
            if (self != nodeController) 
                $timeout(() => {self.selected = false});
        });
    }
    this.toggleChildren = function() {
        $timeout(() => {self.collapsed = !self.collapsed});
    }
    this.setCollapsed = function(collapsed) {
        $timeout(() => {self.collapsed = collapsed});
    }
    this.collapseAll = function() {
        $scope.$broadcast('collapsed-command', true);
    }
    this.expandAll = function() {
        $scope.$broadcast('collapsed-command', false);
    }
    this.onClick = function($event) {
        $event.preventDefault();
        if (!$event.metaKey && !$event.ctrlKey) {
            this.wiTreeView.deselectAllExcept(self);
        }
        $timeout(() => {self.selected = true});
        if (self.clickFn) {
          self.clickFn($event, self.treeRoot);
        }
    }
}
