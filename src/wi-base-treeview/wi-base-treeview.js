const componentName = 'wiBaseTreeview';
const moduleName = 'wi-base-treeview';
require('./wi-base-treeview.less');
var wiToken = require('../wi-token');
let app = angular.module(moduleName, [wiToken.name]);
app.component(componentName, {
    template: require('./wi-base-treeview.html'),
    controller: WiBaseTreeController,
    controllerAs: componentName,
    bindings: {
        name: '@',
        container: '<',
        config: '<',
        onReadyFunction: '<',
        onClickFunction: '<',
        afterClickFunction: '<',
        showContextMenuFunction: '<',
        isShowParentName: '<',
        filter: '@',
        filterBy: '@',
        filterKey: '<',
        filterOptions: '<',
        filterAll: '<',
        onSelectFunction: '<',
        showId: '<',
        hightlightItemFunc: '<',
    }
})

exports.name = moduleName;

const itemHeight = 42;
function WiBaseTreeController($scope, $element, $timeout, $http, wiToken) {
    let self = this;
    const ignoreKeys = ['$$hashKey', 'icon', 'id', 'currentState', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'parentDataArr'];

    function isColor(string) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(string);
    }

    function isKeyIgnored(key) {
        return ignoreKeys.includes(key) || key.includes('_');
    }

    function getValueArr(object) {
        if (!object) return [];
        const valueArr = [];
        for (const key in object) {
            if (isKeyIgnored(key)) continue;
            if (object.hasOwnProperty(key)) {
                const value = object[key];
                const valueType = typeof value;
                if (valueType === 'object') {
                    if (Array.isArray(value) && value.length > 10) continue;
                    valueArr.push(...getValueArr(value));
                } else if ((valueType === 'string' || valueType === 'number') && !isColor(value)) valueArr.push(value);
            }
        }
        return valueArr;
    }

    function filterLabel(node) {
        if (self.filterKey) {
            let valueArr = [];
            Object.keys(self.filterKey).forEach(key => {
                if (!self.filterKey[key]) return;
                switch (key) {
                    case 'name':
                        node.data.label && valueArr.push(node.data.label);
                        break;
                    case 'wellHeader':
                        if (node.type === 'well' && node.properties) valueArr.push(..._.without(node.properties.wellheaders.map(wh => wh.value), undefined, null));
                        break;
                    case 'family':
                        if (node.type === 'curve') valueArr.push(_.get(node, 'properties.family.name'));
                        break;
                    case 'unit':
                        if (node.type === 'curve') valueArr.push(_.get(node, 'properties.unit'))
                        break;
                    default:
                        return;
                }
            })
            return valueArr.join(' ').toLowerCase();
        }
        if (self.filterAll) return (getValueArr(node.data).join(' ') + getValueArr(node.properties).join(' ')).toLowerCase();
        return (node.data.toggle ? node.data.tooltip : node.data.label).toLowerCase();
    }

    function filterType(input) {
        if (!self.filterBy || !input.type) return true;
        return self.filterBy.includes(input.type.toLowerCase());
    }

    function nodesFromConfig(config, level = 0) {
        const nodes = [];
        if (!Array.isArray(config)) return nodes;
        for (const node of config) {
            if (node.data.hide || node.data.forceHide || node.data.deleted) continue;
            node.level = level;
            nodes.push(node);
            if (node.data.childExpanded && node.children && node.children.length) {
                nodes.push(...nodesFromConfig(node.children, level + 1));
            }
        }
        return nodes;
    }
    this.$onInit = function () {
        self.name = self.name || 'treeviewController' + Date.now();
        self.filter = self.filter || '';
        self.filterOptions = self.filterOptions || {
            strict: true,
            keepChildren: true
        };
        $timeout(() => {
            $scope.inited = true
        }, 100);
        $scope.vsRepeatOptions = {
            scrollParent: $element,
            size: itemHeight,
        }
        self.config = self.config || [];
        if (self.container) self.container[self.name] = self;
        else {
            setTimeout(() => {
                if (self.container) self.container[self.name] = self;
            });
        }
        // if (self.name) wiComponentService.putComponent(self.name, self);
        $scope.$watch(() => this.filterBy, () => {
            self.filterFn();
            self.updateNodes();
        });

        function backupConfig(newConfig = [], oldConfig = []) {
            for (let item of newConfig) {
                const oldItems = oldConfig.filter(i => i.type === item.type && ((!item.id && i.data.label === item.data.label) || (item.id && i.id === item.id)));
                if (oldItems.length !== 1) continue;
                const oldItem = oldItems[0];
                if (oldItem.type === item.type && oldItem.id === item.id) {
                    item.data.selected = oldItem.data.selected;
                    item.data.childExpanded = oldItem.data.childExpanded;
                    item.data.prevExpanded = oldItem.data.prevExpanded;
                    if (Array.isArray(oldItem.children) && Array.isArray(item.children)) {
                        backupConfig(item.children, oldItem.children);
                    }
                }
            }
        }
        $scope.$watch(() => this.config, function (newConfig = [], oldConfig = []) {
            backupConfig(newConfig, oldConfig);
        });
        $scope.$watchCollection(() => this.config, function () {
            self.filterFn();
            self.updateNodes();
        });
        $scope.$watch(() => [this.filter, this.filterKey, this.filterOptions], _.debounce(() => {
            self.filterFn();
            self.updateNodes();
        }, 500), true);
        if (ResizeObserver) {
            new ResizeObserver(() => setTimeout(() => $element.trigger('scroll'))).observe($element[0]);
        }
        const watches = [];
        $scope.$on('vsRepeatReinitialized', function (event, startIdx, endIdx) {
            for (const unwatch of watches) unwatch();
            watches.length = 0;
            for (let i = startIdx; i <= endIdx; i++) {
                self.nodes[i] && watches.push(
                    $scope.$watchCollection(() => _.get(self.nodes[i], `children`), function (cur, old) {
                        self.updateNodesDebounced();
                    })
                );
            }
        });
        self.onReadyFunction && onScroll();
    };
    const onReadyFunctionDebounced = _.debounce(function () {
        $element.find('.wi-treeview-container').each(function () {
            const draggable = $(this).draggable('instance');
            draggable && draggable.destroy();
            const droppable = $(this).droppable('instance');
            droppable && droppable.destroy();
        });
        self.onReadyFunction && self.onReadyFunction();
    }, 100);

    function onScroll() {
        $element.on('scroll', onReadyFunctionDebounced);
    }
    this.updateNodes = function () {
        self.nodes = nodesFromConfig(self.config);
        self.onReadyFunction && onReadyFunctionDebounced();
        if (!$scope.$root.$$phase) $scope.$digest();
    }
    this.updateNodesDebounced = _.debounce(this.updateNodes, 200);
    let _searching = false;

    function filterF(input) {
        if (self.filter === undefined) return;
        let queries = self.filter || '';
        queries = queries.toLowerCase();
        let matches = new Array();
        visit(input, function (_node, _options) {
            if (_node.type === 'project') return;
            if (!_searching) _node.data.prevExpanded = _node.data.childExpanded;
            if (!filterType(_node)) {
                _node.data.hide = true;
                return;
            }
            if (queries.length === 0) {
                _node.data.hide = false;
                if (_searching && typeof _node.data.prevExpanded === 'boolean') _node.data.childExpanded = _node.data.prevExpanded;
                return;
            }
            const nodeStr = filterLabel(_node);
            let match = false;
            if (self.filterOptions.strict) match = nodeStr.includes(queries);
            else {
                const regex = new RegExp(queries.split('').map(c => c.replace(/([.?*+^$[\]\\(){}|-])/, "\\$1")).join('.*?'));
                match = nodeStr.search(regex) > -1;
            }
            if (match) {
                _node.data.hide = false;
                _options.push(_node);
            } else _node.data.hide = true;
            return false;
        }, matches);
        if (!matches.length) return;
        let parents = [];
        matches.forEach(item => {
            visit(input, function (_node, _opt) {
                if (_node == item) {
                    _opt.path.slice(0, -1).forEach(n => {
                        if (parents.indexOf(n) < 0) parents.push(n);
                    })
                    return true
                }
                return false;
            }, {
                path: []
            })
            // show children
            if (self.filterOptions.keepChildren) visit(item, (_node) => _node.data.hide = false);
        })
        parents.forEach(c => {
            c.data.hide = false
            if (!_searching) c.data.prevExpanded = c.data.childExpanded || false;
            c.data.childExpanded = true;
        });
    }
    this.filterFn = function () {
        if (self.config && self.config.length) {
            self.config.forEach((c, i) => {
                filterF(c);
            })
            const queries = self.filter || '';
            _searching = !!queries.length;
            if (!$scope.$root.$$phase) $scope.$digest();
        }
    }

    this.onCollapse = function (node, $index, $event) {
        let childSelected = false;
        visit(node, function (_node) {
            if (_node.data.selected && _node !== node) {
                childSelected = true;
                return true;
            }
        });
        if (childSelected) self.onClick($index, $event, node);
        if (node.children) {
            node.data.childExpanded = !node.data.childExpanded;
            node.data.prevExpanded = node.data.childExpanded;
            self.updateNodes();
        }
    };

    this.addItem = function (parentName, item) {
        let parentItem = this.getItemByName(parentName);

        if (parentItem) parentItem.children.push(item);
    };

    this.addItemToFirst = function (parentName, item) {
        console.log('addItemToFirst self', self);
        let parentItem = this.getItemByName(parentName);
        if (parentItem) {
            parentItem.children.unshift(item);
        }
    };

    this.expand = function (node) {
        node.data.childExpanded = true;
        for (let child of node.children) {
            if (child.data.hide) continue;
            child.data.childExpanded = true;
        }
        self.updateNodes();
    };

    this.collapse = function (node) {
        node.data.childExpanded = false;
        for (let child of node.children) {
            if (child.data.hide) continue;
            child.data.childExpanded = false;
        }
        self.updateNodes();
    };

    this.expandAll = expandAll;

    function expandAll(children) {
        if (!children) {
            return;
        }
        for (let child of children) {
            if (child.data.hide) continue;
            child.data.childExpanded = true;
            expandAll(child.children);
        }
        self.updateNodes();
    }

    this.collapseAll = collapseAll;

    function collapseAll(children) {
        if (!children) {
            return;
        }
        for (let child of children) {
            if (child.data.hide) continue;
            child.data.childExpanded = false;
            child.data.prevExpanded = child.data.childExpanded;
            collapseAll(child.children);
        }
        self.updateNodes();
    }

    function unselectAllNodes() {
        self.config.forEach(function (item) {
            visit(item, function (node) {
                if (node.data) node.data.selected = false;
            });
        });
    }
    this.onClick = function ($index, $event, node) {
        const parentNode = getParentNode(node, self.config);
        $index = parentNode.children.indexOf(node);
        self.onSelectFunction && self.onSelectFunction(node);
        self.onClickFunction && self.onClickFunction($index, $event, node);
        if (!self.onSelectFunction && !self.onClickFunction) {
            this.baseClick.apply(this, arguments);
        }
        self.afterClickFunction && self.afterClickFunction(node, $index);
        if (!Array.isArray(node.children) || !node.children.length) {
            setTimeout(() => {
                const unwatch = $scope.$watchCollection(() => node.children, function (cur, old) {
                    self.updateNodesDebounced();
                    setTimeout(unwatch, 1000);
                });
            });
        }
        // console.log("onClick");
    }
    this.baseClick = function ($index, $event, node) {
        const selectedNodes = self.getSelectedNodes();
        const parentNode = getParentNode(node, self.config);
        node.$index = $index;
        if (!$event.shiftKey) {
            if (!$event.ctrlKey || node.type != selectedNodes[0].type || parentNode != getParentNode(selectedNodes[0], self.config)) {
                if ($event.type == "contextmenu" && selectedNodes.includes(node)) return;
                unselectAllNodes();
            }
            node.data.selected = true;
        } else {
            if (!selectedNodes.length) return;
            if (selectedNodes.includes(node)) return;
            unselectAllNodes();
            if (
                node.type != selectedNodes[0].type ||
                parentNode != getParentNode(selectedNodes[0], self.config)
            ) {
                node.data.selected = true;
            } else {
                let fromIndex = Math.min($index, selectedNodes[0].$index);
                let toIndex = Math.max($index, selectedNodes.slice(-1)[0].$index);
                for (let i = fromIndex; i <= toIndex; i++) {
                    if (parentNode.children[i].type === node.type) parentNode.children[i].data.selected = true;
                }
            }
        }
        // console.log("baseClick");
    }
    this.getSelectedNodes = function () {
        return self.nodes.filter(n => n.data.selected && !n.data.forceHide);
    }

    this.onDoubleClick = function (selectedNode) {
        if (selectedNode.handler) {
            selectedNode.handler();
            return;
        }
        if (selectedNode.children && selectedNode.children.length) {
            selectedNode.data.childExpanded = !selectedNode.data.childExpanded;
            self.updateNodes();
            return;
        }
    }
    this.showContextMenu = function ($event, $index, node) {
        console.log(node);
        typeof this.showContextMenuFunction === 'function' && this.showContextMenuFunction.apply(this, arguments);
    }
    this.isFalsy = function (item) {
        if (self.hightlightItemFunc) return self.hightlightItemFunc(item);
        item.falsy = '';
    }
    this.scrollToNode = function ({ type, id }) {
        let node = null;
        const paths = getSelectedPath(n => {
            if (n.type == type && n.id == id) {
                node = n;
                return true;
            }
        }, self.config);
        if (!Array.isArray(paths) || !paths.length) return;
        for (let i = 0; i < paths.length - 1; i++) {
            paths[i].data.childExpanded = true;
        }
        unselectAllNodes();
        node.data.selected = true;
        self.updateNodes();
        const idx = self.nodes.findIndex(n => n === node);
        $element.animate({ scrollTop: idx * itemHeight });
    }
}

function visit(node, callback, options = {}) {
    if (options && options.found) return;
    if (node.data && node.data.deleted) return;
    if (options && options.path && options.path.push)
        options.path.push(node);
    try {
        if (callback(node, options)) {
            if (options) options.found = true
        }
    } catch (e) {}
    if (node.children) {
        node.children.forEach(function (child) {
            visit(child, callback, options);
        });
    } else if (Array.isArray(node)) {
        node.forEach(function (child) {
            visit(child, callback, options);
        });
    }
    if (options && options.path && options.path.pop)
        options.path.pop();
}
const pseudoParentNode = {
    children: []
};

function getParentNode(node, rootNode, parentType) {
    const path = getSelectedPath(node, rootNode);
    let parentNode = parentType ? path.find(p => p.type === parentType) : path[path.length - 2];
    if (!parentNode) {
        if (Array.isArray(rootNode)) parentNode = Object.assign(pseudoParentNode, {
            children: rootNode
        });
        else if (typeof rootNode === 'object') parentNode = rootNode;
    }
    return parentNode;
}

function getSelectedPath(foundCB, rootNode) {
    // const wiComponentService = __GLOBAL.wiComponentService;
    if (!rootNode) {
        console.error("rootNode invalue");
        return;
    }
    if (!rootNode) return;
    let selectedPath = new Array();
    visit(rootNode, function (node, options) {
        if (foundCB) {
            if ((typeof foundCB === 'function' && foundCB(node)) || (typeof foundCB === 'object' && node === foundCB)) {
                selectedPath = options.path.slice();
                return true;
            }
        } else if (node.data.selected == true) {
            selectedPath = options.path.slice();
            return true;
        }
        return false;
    }, {
        path: new Array()
    });
    return selectedPath.filter(n => !Array.isArray(n));
}