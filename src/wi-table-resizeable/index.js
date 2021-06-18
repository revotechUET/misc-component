var componentName = 'wiTableResizeable';

export const name = componentName;

require('./wi-table-resizeable.less');

var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./wi-table-resizeable.html'),
    controller: wiTableResizeableController,
    controllerAs: 'self',
    bindings: {
        headers: '<',
        defaultWidths: '<',
        onHeaderWidthChanged: "<",
        onTableInit: "<",
        orderHeader: '=',
        orderReverse: '=',
    },
    transclude: true
});
wiTableResizeableController.$inject = ['$element', '$timeout', '$scope'];
function wiTableResizeableController($element, $timeout, $scope) {
    let self = this;
    const MIN_WIDTH = 40;
    self.columnWidths = [];
    function calculateWidth(widthValues) {
       try{
        let _widthValues = widthValues || self.defaultWidths;
        let totalWidth = $element.find('.header-table-resizeable').width();
        //CREATE HEADER ARRAY
        self.headers = self.headers || ['col1', 'col2', 'col3', 'col4', 'col5'];

        if ( _widthValues ) {
            let accWidth = 0;
            for (let index = 0; index < self.headers.length - 1; index++) {
                accWidth += self.defaultWidths[index];
                self.columnWidths[index] = _widthValues[index];
            }
            self.columnWidths[self.headers.length - 1] = totalWidth - accWidth;
        }
        else {
            for (let index = 0; index < self.headers.length; index++) {
                self.columnWidths[index] = totalWidth / self.headers.length;
            }
        }
        self.onTableInit && self.onTableInit(self.columnWidths);
        //CREATE HOLDER DRAG
       } catch (e) {
       }
    }
    let calculateWidthDebounce = _.debounce(calculateWidth, 0);
    function setupResizers() {
        $element.find('.holder-resizeable').draggable({
            containment: $element.find('.header-table-resizeable')[0],
            axis: "x",
            start: function (event, ui) {
                //FIND OLD POSITION
                self.oldPosition = ui.helper.position().left;
                //FIND HOLDER DRAG
                self.holderDraggingIdx = parseInt(ui.helper.attr("ordinal"));
            },
            stop: function (event, ui) {
                //FIND NEW POSITION
                self.newPosition = ui.helper.position().left;
                let leftColIdx = self.holderDraggingIdx;
                let rightColIdx = self.holderDraggingIdx + 1;
                let leftColWidth = self.columnWidths[leftColIdx];
                let rightColWidth = self.columnWidths[rightColIdx];

                let offset = self.newPosition - self.oldPosition;
                if (offset > 0) {
                    offset = Math.min(offset, rightColWidth - MIN_WIDTH);
                }
                else {
                    offset = Math.max(offset, -1*(leftColWidth - MIN_WIDTH));
                }
                leftColWidth += offset;
                rightColWidth -= offset;
                self.columnWidths[leftColIdx] = leftColWidth;
                self.columnWidths[rightColIdx] = rightColWidth;
                ui.helper.css("left", 0);
                $scope.$apply();
                self.onHeaderWidthChanged && self.onHeaderWidthChanged(leftColIdx, leftColWidth, rightColIdx, rightColWidth);
            }
        });
    }
    this.$onInit = function () {
        $timeout(() => {
            let mainElem = $element.find('.main-table-resizeable');
            let resizeSensor = new ResizeSensor(mainElem, function() {
                console.log("resized");
                calculateWidthDebounce(self.columnWidths);
            });
            calculateWidth();
            setupResizers();
        }, 500)
    }
    $scope.typeof = function (arg) {
        return typeof arg;
    }
    this.orderBy = function (header) {
        if (self.orderHeader === header) {
            self.orderReverse = !self.orderReverse;
            return;
        }
        self.orderHeader = header;
    }
}
