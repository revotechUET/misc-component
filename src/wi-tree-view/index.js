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
        selectedIds: "<",
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
        this.selectedIds = this.selectedIds || {};
        console.log(self.treeRoot);
    }
    this.collapseAll = function() {
        $scope.$broadcast('collapsed-command', true);
    }
    this.expandAll = function() {
        $scope.$broadcast('collapsed-command', false);
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
}
function wiTreeNodeController($element, $timeout, $scope) {
    let self = this;
    this.showNode = function() {
        let matched = self.runMatch(self.treeRoot, self.filter);
        self.filter1 = (matched && self.keepChildren) ? '' : self.filter;
        return matched;
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
        })

        $element.find(".node-content").draggable({
            //helper: 'clone',
            helper: function() {
                let wrapper = $('<div style="border:4px solid red;"></div>');
                
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
        if (!$event.metaKey && !$event.ctrlKey && !$event.shiftKey) {
            self.wiTreeView.deselectAllExcept(self);
        }

        if ($event.shiftKey) {
            self.wiTreeView.selectRange($scope.$id);
        }
        self.select();

        if (self.clickFn) {
            self.clickFn($event, self.treeRoot);
        }
    }
}
