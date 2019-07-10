const name = 'wiDiscriminator';

let app = angular.module(name, ['ui.select', 'ui.bootstrap']);

const wiConditionNode = require('./wi-cond-node');
const wiMultiInput = require('./wi-dual-input');

app.component(name, {
    template: require('./template.html'),
    style: require('./style.less'),
    controller: Controller,
    controllerAs: 'self',
    bindings: {
        conditionTree: "<",
        curvesArr: "<"
    }
});

exports.name = name;
function Controller($scope) {
    let self = this;
    $scope.$on('discriminator-update', function($event) {
        $event.stopPropagation();
        $event.preventDefault();
        self.conditionExpr = parse(self.conditionTree);
        self.conditionTree.conditionExpr = self.conditionExpr;
    });
    this.isConditionTreeActive = () => (self.conditionTree.active);
    this.toggleConditionTree = () => {
        self.conditionTree.active = !self.conditionTree.active;
    }
    this.isNull = function (node) {
        return !(node && (node.operator || node.comparison));
    }
    this.addCondition = function () {
        let path = new Array();
        let retVal = visit(self.conditionTree, path, function (aNode) {
            return aNode.selected;
        });
        let selectedNode;
        let parentNode = null;

        if (!self.conditionTree || self.isNull(self.conditionTree)) {
            self.conditionTree = Object.assign(self.conditionTree || {}, {
                comparison: '>',
                left: {
                    type: 'curve',
                    value: getFirstCurve()
                },
                right: {
                    type: 'value',
                    value: 0
                }
            });
            self.conditionExpr = parse(self.conditionTree);
            self.conditionTree.conditionExpr = self.conditionExpr;
            return;
        }

        if (!retVal) selectedNode = self.conditionTree;

        if (retVal) selectedNode = path[0];

        let newNode = {
            active: selectedNode.active,
            operator: 'and',
            children: [
                Object.assign({}, selectedNode),
                {
                    comparison: '>',
                    left: {
                        type: 'curve',
                        value: getFirstCurve()
                    },
                    right: {
                        type: 'value',
                        value: 0
                    }
                }
            ]
        };
        if (path.length > 1) {
            parentNode = path[1];
            let selectedIdx = parentNode.children.indexOf(selectedNode);
            parentNode.children[selectedIdx] = newNode;
        }
        else {
            for (let prop in self.conditionTree) delete self.conditionTree[prop];
            Object.assign(self.conditionTree, newNode);
        }
        self.conditionExpr = parse(self.conditionTree);
        self.conditionTree.conditionExpr = self.conditionExpr;

    }
    this.deleteCondition = function () {
        let path = new Array();
        let retVal = visit(self.conditionTree, path, function (aNode) {
            return aNode.selected;
        });
        if (retVal) {
            if (path.length >= 3) {
                let selectedNode = path[0];
                let parentNode = path[1];
                let gParentNode = path[2];

                let parentIdx = gParentNode.children.indexOf(parentNode);
                let selectedIdx = parentNode.children.indexOf(selectedNode);
                let theOtherNode = parentNode.children[(selectedIdx + 1) % 2];
                gParentNode.children[parentIdx] = theOtherNode;
            }
            else if (path.length === 2) {
                let selectedNode = path[0];
                let parentNode = path[1];
                let selectedIdx = parentNode.children.indexOf(selectedNode);
                let theOtherNode = Object.assign({}, parentNode.children[(selectedIdx + 1) % 2]);
                for (let prop in self.conditionTree) {
                    if (prop !== "active")
                        delete self.conditionTree[prop];
                }
                Object.assign(self.conditionTree, theOtherNode);
            }
            else if (path.length === 1) {
                for (let prop in self.conditionTree) 
                    if (prop !== "active")
                        delete self.conditionTree[prop];
                //self.conditionTree = null;
            }
            else {
                errorMessageDialog(ModalService, "Never happen!!");
            }
            self.conditionExpr = parse(self.conditionTree);
            self.conditionTree.conditionExpr = self.conditionExpr;
        }
    }
    function visit(node, visitedPath, matchFunc) {
        if (!node || self.isNull(node)) return false;
        visitedPath.unshift(node);
        if (matchFunc(node)) {
            return true;
        }
        else {
            if (node.children && node.children.length) {
                for (let childNode of node.children) {
                    if (visit(childNode, visitedPath, matchFunc)) {
                        return true;
                    }
                    visitedPath.shift();
                }
            }
        }
        return false;
    }
    function parse(tree) {
        let str = "";
        if (!tree) return "";
        if (tree.children && tree.children.length) {
            return "( " + parse(tree.children[0]) + " " + tree.operator.toUpperCase() + " " + parse(tree.children[1]) + " )";
        }
        else if (tree.left && tree.right && tree.comparison) {
            let left = tree.left.value;
            // let right = tree.right.type=='value'? tree.right.value: getCurveName(tree.right.value);
            let right = tree.right.value;
            return "( " + left + " " + tree.comparison + " " + right + " )";
        }

        return str;
    }
    function getFirstCurve() {
        return self.curvesArr[0].name;
    }
}
