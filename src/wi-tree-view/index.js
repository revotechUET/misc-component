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
        collapsed: "<",
        singleNode: "<",
        getSiblings: "<",
        onContextMenu: '<',
        contextMenu: '<',
        hideUnmatched: '<'
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
        selectedIds: "<",
        collapsed: "<",
        singleNode: "<",
        getSiblings: "<",
        onContextMenu: '<',
        contextMenu: "<",
        hideUnmatched: '<'
    },
    transclude: true
});
function wiTreeViewController($element, $timeout, $scope) {
    let self = this;
    if (!window.wiTreeCtrl)
        window.wiTreeCtrl = this;
    this.$onInit = function () {
        self.collapsed = (self.collapsed == undefined || self.collapsed === null)? true : self.collapsed;
        self.getSiblings = self.getSiblings || function(n) {return []}
        this.selectedIds = this.selectedIds || {};
        this.onContextMenu = this.onContextMenu || function() {
            console.log("default context menu");
        };
        $scope.$watch(() => (self.treeRoot), () => {
            self.selectedIds = {};
        });
        $scope.$watch(() => (self.filter), () => {
            for (let n of self.treeRoot) {
                visit(n, (node) => {
                    node._hidden = false;
                    return false;
                }, null, 0);
                visit(n, (node) => {
                    let matched = self.runMatch(node, self.filter);
                    node._hidden = !matched;
                    return self.keepChildren && matched;
                }, (node, result) => {
                    console.log('result', result);
                    node._hidden = !result;
                }, 0);
            }
            $timeout(() => {});
        });
    }
    this.collapseAll = function() {
        $scope.$broadcast('collapsed-command', true);
    }
    this.expandAll = function() {
        $scope.$broadcast('collapsed-command', false);
    }
    this.getChildrenWrapper = function(node) {
        if (Array.isArray(node)) return node;
        return self.getChildren(node);
    }
    this.deselectAllExcept = function(scopeId) {
        $scope.$broadcast('deselect-command', $scope.$id);
    }
    this.selectRange = function(scopeId) {
        let [min, max] = getExtentIds(self.selectedIds);
        $scope.$broadcast('select-range-command', [Math.min(scopeId, min), Math.max(scopeId, max)]);
    }
    function getExtentIds(hash) {
        let keys = Object.keys(hash).sort();
        return [keys[0], keys[keys.length-1]];
    }
    function visit(node, cb, cb1, depth) {
        if (!node) return false;
        console.log(`visit (${depth}): ${self.getLabel(node)} hidden: ${node._hidden}`);
        
        let stop = cb(node);

        if (stop) return true;
        let children = self.getChildren(node);
        if (!children || !children.length) return false;
        let result = false;
        for (let child of children) {
            let result1 = visit(child, cb, cb1, depth + 1);
            result = result || result1;
        }
        cb1 && cb1(node, result);

        console.log(`exit (${depth}):${self.getLabel(node)} hidden: ${node._hidden}`);
        return result;
    }
}
function wiTreeNodeController($element, $timeout, $scope) {
    let self = this;
    this.showNode = function() {
        return !self.treeRoot._hidden;
    }
    this.getChildrenWrapper = function(node) {
        if (Array.isArray(node)) return node;
        if (!self.singleNode)
            return self.getChildren(node);
        if (node._active) return self.getChildren(node);
        return [];
    }
    this.deselect = function() {
        $timeout(() => {self.selected = false});
        delete self.wiTreeView.selectedIds[$scope.$id];
    }
    this.select = function() {
        $timeout(() => {self.selected = true});
        self.wiTreeView.selectedIds[$scope.$id] = {elem:$element.find('.node-content')[0], data:self.treeRoot};
    }
    this.$onInit = function () {
        self.collapsed = (self.collapsed == undefined || self.collapsed === null)? true : self.collapsed;
        $scope.$on('collapsed-command', function($event, collapsed) {
            $timeout(() => {self.collapsed = collapsed});
        });
        $scope.$on('deselect-command', function($event, id) {
            if ($scope.$id != id) 
                self.deselect();
        });
        $scope.$on('select-range-command', function($event, [startId, stopId]) {
            if (($scope.$id - startId) * ($scope.$id - stopId) < 0)
                self.select();
        });

        $element.find(".node-content").draggable({
            //helper: 'clone',
            helper: function() {
                let wrapper = $('<div style="border:2px dotted #0077be;"></div>');
                
                //wrapper.append(this.cloneNode(true));
                Object.values(self.wiTreeView.selectedIds).forEach((item) => {
                    wrapper.append(wrapper.append(item.elem.cloneNode(true)));
                });
                return wrapper;
            },
            start: function($event, ui) {
                ui.helper.addClass('dragging');
                ui.helper.myData = Object.values(self.wiTreeView.selectedIds).map(item => item.data);
                self.onDragStart && self.onDragStart(ui.helper.myData);
            },
            stop: function($event, ui){
                self.onDragStop && self.onDragStop(ui.helper.myData);
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
        $event.stopPropagation();
        if ($event.button === 2) {
            self.onContextMenu(self.treeRoot);
            return;
        }
        self.treeRoot._active = true;
        
        self.getSiblings(self.treeRoot).forEach(n => n._active = false);

        if (!$event.metaKey && !$event.ctrlKey && !$event.shiftKey) {
            self.wiTreeView.deselectAllExcept($scope.$id);
        }

        if ($event.shiftKey) {
            self.wiTreeView.selectRange($scope.$id);
        }
        self.select();

        if (self.clickFn) {
            self.clickFn($event, self.treeRoot, self.wiTreeView.selectedIds);
        }
    }
}
