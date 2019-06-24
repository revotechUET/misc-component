// module.exports = function controller($element, $timeout, $scope) {
//   let self = this;
//   this.showNode = function() {
//       return !(self.treeRoot || {})._hidden;
//   }
//   this.getIconStyle = function (){
//       if(typeof self.iconStyle == 'function') {
//           return self.iconStyle(self.treeRoot);
//       }
//       return self.iconStyle;
//   }
//   this.getChildrenWrapper = function(node) {
//       if (Array.isArray(node)) return node;
//       if (!self.singleNode)
//           return self.getChildren(node);
//       if (node._active) return self.getChildren(node);
//       return [];
//   }
//   this.deselect = function() {
//       $timeout(() => {self.treeRoot._selected = false});
//       delete self.wiTreeView.selectedIds[$scope.$id];
//   }
//   this.select = function() {
//       $timeout(() => {self.treeRoot._selected = true});
//       self.wiTreeView.selectedIds[$scope.$id] = {elem:$element.find('.node-content')[0], data:self.treeRoot};
//   }
//   this.$onInit = function () {
//       self.collapsed = (self.collapsed == undefined || self.collapsed === null)? true : self.collapsed;
//       if (self.uncollapsible) self.collapsed = false;
//       self.keepChildren = (self.keepChildren === undefined || self.keepChildren === null)? true : self.keepChildren;
//       $scope.$on('collapsed-command', function($event, collapsed) {
//           $timeout(() => {self.collapsed = collapsed});
//       });
//       $scope.$on('deselect-command', function($event, id) {
//           if ($scope.$id != id) 
//               self.deselect();
//       });
//       $scope.$on('select-range-command', function($event, [startId, stopId]) {
//           if (($scope.$id - startId) * ($scope.$id - stopId) < 0)
//               self.select();
//       });
//       $element.find(".node-content").draggable({
//           //helper: 'clone',
//           helper: function() {
//               let wrapper = $('<div style="border:2px dotted #0077be;"></div>');

//               //wrapper.append(this.cloneNode(true));
//               Object.values(self.wiTreeView.selectedIds).forEach((item) => {
//                   wrapper.append(wrapper.append(item.elem.cloneNode(true)));
//               });
//               return wrapper;
//           },
//           start: function($event, ui) {
//               ui.helper.addClass('dragging');
//               ui.helper.myData = Object.values(self.wiTreeView.selectedIds).map(item => item.data);
//               self.onDragStart && self.onDragStart(ui.helper.myData);
//           },
//           stop: function($event, ui){
//               self.onDragStop && self.onDragStop(ui.helper.myData);
//           }
//       });
//   }
//   this.toggleChildren = function() {
//       if (self.uncollapsible) {
//           self.collapsed = false;
//           return;
//       }
//       $timeout(() => {self.collapsed = !self.collapsed});
//   }
//   this.setCollapsed = function(collapsed) {
//       if (self.uncollapsible) {
//           self.collapsed = false;
//           return;
//       }
//       $timeout(() => {self.collapsed = collapsed});
//   }
//   this.collapseAll = function() {
//       if (self.uncollapsible) return;
//       $scope.$broadcast('collapsed-command', true);
//   }
//   this.expandAll = function() {
//       if (self.uncollapsible) return;
//       $scope.$broadcast('collapsed-command', false);
//   }
//   this.onClick = function($event) {
//       $event.preventDefault();
//       $event.stopPropagation();
//       if ($event.button === 2) {
//           self.onContextMenu(self.treeRoot);
//           return;
//       }
//       self.treeRoot._active = true;

//       self.getSiblings(self.treeRoot).forEach(n => n._active = false);

//       if (!$event.metaKey && !$event.ctrlKey && !$event.shiftKey) {
//           self.wiTreeView.deselectAllExcept($scope.$id);
//       }

//       if ($event.shiftKey) {
//           self.wiTreeView.selectRange($scope.$id);
//       }
//       self.select();

//       if (self.wiTreeView.clickFn) {
//           self.wiTreeView.clickFn($event, self.treeRoot, self.wiTreeView.selectedIds, self.wiTreeView.treeRoot);
//       }
//   }
// }

module.exports = function controller($element, $timeout, $scope) {
    const self = this;

    self.$onInit = function () {
        // console.log(self.treeRoot)
        // self.collapsed = (self.collapsed == undefined || self.collapsed === null) ? true : self.collapsed;
        // $element.find(".node-content").draggable({
        //     helper: function () {
        //         let wrapper = $('<div style="border:2px dotted #0077be;"></div>');

        //         //// wrapper.append(this.cloneNode(true));
        //         // Object.values(self.wiTreeView.selectedIds).forEach((item) => {
        //         //     wrapper.append(wrapper.append(item.elem.cloneNode(true)));
        //         // });
        //         return wrapper;
        //     },
        //     start: function ($event, ui) {
        //         ui.helper.addClass('dragging');
        //         // ui.helper.myData = Object.values(self.wiTreeView.selectedIds).map(item => item.data);
        //         ui.helper.myData = self.treeRoot;
        //         self.onDragStart && self.onDragStart(ui.helper.myData);
        //     },
        //     stop: function ($event, ui) {
        //         self.onDragStop && self.onDragStop(ui.helper.myData);
        //     }
        // });
    }

    self.showNode = function () {
        return !(self.treeRoot || {})._hidden;
    }
    

    // self.toggleChildren = function () {
    //     if (self.uncollapsible) {
    //         self.collapsed = false;
    //         return;
    //     }
    //     $timeout(() => { self.collapsed = !self.collapsed });
    // }

    self.onClick = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        if ($event.button === 2) {
            self.onContextMenu(self.treeRoot);
            return;
        }
        self.select();
    }

    self.getIconStyle = function () {
        if (typeof self.iconStyle == 'function') {
            return self.iconStyle(self.treeRoot);
        }
        return self.iconStyle;
    }

    self.deselect = function () {
        $timeout(() => { self.treeRoot._selected = false });
        // delete self.wiTreeView.selectedIds[$scope.$id];
    }

    self.select = function () {
        $timeout(() => { self.treeRoot._selected = true });
        // self.wiTreeView.selectedIds[$scope.$id] = { elem: $element.find('.node-content')[0], data: self.treeRoot };
    }

    self.getPadding = function() {
        return `${parseInt(self.treeRoot._lv) * 19}px` 
    }
}