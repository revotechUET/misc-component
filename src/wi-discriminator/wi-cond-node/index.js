const name = 'wiCondNode';
const moduleName = 'wiDiscriminator';

let app = angular.module(moduleName);

app.component(name, {
    template: require('./template.html'),
    style: require('./style.less'),
    controller: Controller,
    controllerAs: "self",
    bindings: {
        item: '<',
        curveOptions: '<',
        onDelete: '<',
        root: '<'
    },
    require: {
        wiDiscriminatorCtrl: "^^wiDiscriminator"
    }
});
Controller.$inject = ['$scope', '$timeout'];
function Controller($scope, $timeout) {
    let self = this;
    this.$onInit = function () {
        console.log( self.root);
        console.log(self.item);
        console.log(self.onDelete);
        $timeout(function () {
            self.curveOptionsWithDepth = self.curveOptions;
        }, 500);
    }

    this.groupFn = function (item) {
        return item.parent;
    }

    this.comparisons = ['<', '>', '=', '<=', '>='];
    this.operators = ['and', 'or'];

    this.isNull = function () {
        return self.wiDiscriminatorCtrl.isNull(self.item);
    }
    function clearSelectedItem(node) {
        if (!node || !Object.keys(node).length) return;
        node.selected = false;
        if (node.children && node.children.length) {
            for (let childNode of node.children) {
                clearSelectedItem(childNode);
            }
        }

    }
    this.update = () => {
        $scope.$emit('discriminator-update', {});
    }
    this.doSelect = function ($event) {
        $event.stopPropagation();
        clearSelectedItem(self.root);
        if (self.item && Object.keys(self.item).length)
            self.item.selected = true;
    }
}
