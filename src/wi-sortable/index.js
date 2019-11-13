let componentName = 'wiSortable';

module.exports.name = componentName;

let app = angular.module(componentName, []);
app.component(componentName, {
    template: require('./template.html'),
    controller: sortableController,
    controllerAs: 'self',
    bindings: {
        updateFn: '<',
        itemList: '<',
        relatedList: '<',
        containerClass: '<'
    },
    transclude: true
})

function sortableController($element, $timeout, $scope) {
    let self = this;

    this.$onInit = function() {
        self.relatedList = self.relatedList || [];
        $scope.$watch(() => $element.find('.wi-sortable .sort-item').length, function() {
            $element.find('.wi-sortable .sort-item').each(function(i, elem) {
                $(elem).attr('sortable-index', i);
            });
        });
        $element.find('.wi-sortable').sortable({
            update: function(event, ui) {
                if (self.relatedList && self.relatedList.length) {
                    let oldIdxList = [];
                    $element.find('.wi-sortable .sort-item').each(function(index) {
                        let item = $(this);
                        oldIdxList.push(parseInt(item.attr("sortable-index"), 10));
                    });
                    self.relatedList.forEach(list => {
                        let modelLength = list.length;
                        oldIdxList.forEach(function(oldIndex) {
                            list.push(list[oldIndex]);
                        });
                        list.splice(0, modelLength);
                    })
                }

                let model = self.itemList;
                let modelLength = model.length;
                let items = [];
                $element.find('.wi-sortable .sort-item').each(function(index) {
                    let item = $(this);
                    let oldIndex = parseInt(item.attr("sortable-index"), 10);
                    model.push(model[oldIndex]);

                    if(item.attr("sortable-index")) {
                        items[oldIndex] = item;
                        item.detach();
                    }
                });
                model.splice(0, modelLength);
                $element.find('.wi-sortable').append.apply($element.find('.wi-sortable'), items);
                self.updateFn && self.updateFn();
            },
            stop: function(event, ui) {
            }
        });
    }
}
