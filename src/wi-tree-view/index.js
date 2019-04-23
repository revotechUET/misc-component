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
        onDragStart: "<",
        onDragStop: "<",
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
        onDragStart: "<",
        onDragStop: "<",
        collapsed: "<"
    },
    transclude: true
});
function wiTreeViewController($element, $timeout, $scope) {
    let self = this;
    if (!window.wiTreeCtrl)
        window.wiTreeCtrl = this;
    this.$onInit = function () {
        self.collapsed = (self.collapsed == undefined || self.collapsed === null)? true : self.collapsed;
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
        self.collapsed = (self.collapsed == undefined || self.collapsed === null)? true : self.collapsed;
        $scope.$on('collapsed-command', function($event, collapsed) {
            $timeout(() => {self.collapsed = collapsed});
        });
        $scope.$on('deselect-command', function($event, nodeController) {
            if (self != nodeController) 
                $timeout(() => {self.selected = false});
        });

        $element.find(".node-content").draggable({
            helper: 'clone',
            start: function($event, ui) {
                ui.helper.addClass('dragging');
                ui.helper.myData = self.treeRoot;
                self.onDragStart && self.onDragStart(self.treeRoot);
            },
            stop: function($event, ui){
                self.onDragStop && self.onDragStop(self.treeRoot);
            }
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
