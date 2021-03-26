export const name = "wiTableView";

var module = angular.module(name, ['editable']);

require('./style.css');

module.component(name, {
    template: require("./template.html"),
    controller: Controller,
    controllerAs: "self",
    bindings: {
        headerEditable: "<",
        cellEditable: "<",
        showOriginHeader: "<",
        colHeaders: "<",
        rowHeaders: "<",
        colLabels: "<",
        rowLabels: "<",
        rowCount: "<",
        colCount: "<",
        accessor: "<",
        setter: "<",
        getRowIcons: "<",
        getRowIconStyle: "<",
        validRow: "<",
        rowHeaderCellStyle: '<',
        itemList: '<',
    },
});
Controller.$inject = ['$element', '$scope'];
function Controller($element, $scope) {
    let self = this;

    this.$onInit = function() {
        this.colLabels = this.colLabels || {};
        this.rowLabels = this.rowLabels || {};
        this.getRowIcons = this.getRowIcons || function() { return [] };
        this.getRowIconStyle = this.getRowIconStyle || function() { return {} };
        self.cellStyle = self.cellStyle || {};
        $scope.table = [];
        function setTable() {
            const rows = self.getRows();
            const cols = self.getCols();
            $scope.table = rows.map(r => cols.map(c => self.accessor([r, c])));
        }
        $scope.$watchCollection('self.itemList', setTable)
        $scope.$watchGroup([
            () => JSON.stringify(self.getOriginColHeaders()),
            () => {
                if (typeof self.rowHeaders === 'function')
                    return JSON.stringify(self.rowHeaders())
                return JSON.stringify(self.rowHeaders)
            }
        ], setTable)
    }
    this.getRowHeaderCellStyle = function($index) {
        if (typeof self.rowHeaderCellStyle == 'function') {
            return self.rowHeaderCellStyle($index);
        } else {
            return self.rowHeaderCellStyle;
        }
    }
    this.getRows = function() {
        let rowCount = 0;
        if (typeof self.rowCount === 'function') {
            rowCount = self.rowCount();
        }
        else {
            rowCount = self.rowCount;
        }
        return [...Array(rowCount).keys()];
    }
    this.getCols = function(row) {
        let colCount = 0;
        try {
            if (typeof self.colCount === 'function') {
                colCount = self.colCount(row);
            }
            else {
                colCount = self.colCount;
            }
        }
        catch(e) {
            return [];
        }
        return [...Array(colCount).keys()];
    }
    this.getOriginColHeaders = function() {
        let colHeaders;
        if (typeof self.colHeaders === 'function') {
            colHeaders = self.colHeaders();
        }
        else {
            colHeaders = self.colHeaders;
        }
        return colHeaders;
    }
    this.getColHeader = function(index) {
        let och = self.getOriginColHeaders()[index];
        self.colLabels[och] = self.colLabels[och] || och;
        return self.colLabels[och];
    }
    this.setColHeader = function(index, newColHeader) {
        let originColHeader = self.getOriginColHeaders()[index];
        self.colLabels[originColHeader] = newColHeader;
    }
    this.getOriginRowHeader = function(index) {
        let rowHeaders;
        if (!self.rowHeaders) return index + 1;
        if (typeof self.rowHeaders === 'function') {
            rowHeaders = self.rowHeaders();
        }
        else {
            rowHeaders = self.rowHeaders;
        }
        return rowHeaders[index];
    }
    this.getRowHeader = function(index) {
        let orh = self.getOriginRowHeader(index);
        self.rowLabels[orh] = self.rowLabels[orh] || orh;
        return self.rowLabels[orh];
    }
    this.setRowHeader = function(index, newRowHeader) {
        let originRowHeader = self.getOriginRowHeader(index);
        self.rowLabels[originRowHeader] = newRowHeader;
    }
    this.cellClick = function(row, col) {
        self.selectedRow = row + headerRowCount();
        self.selectedCol = col + headerColCount();
    }
    this.indicatorStyle = function() {
        let display = 'none';
        let row = $element.find('.row')[self.selectedRow];
        if (!row) return { display };
        let cell = $(row).find('.cell')[self.selectedCol];
        if (!cell) return { display };
        return {
            display: 'block',
            width: cell.clientWidth,
            height: cell.clientHeight,
            top: cell.offsetTop,
            left: cell.offsetLeft
        }
    }
    this.keyUp = function($event) {
        if ($event.keyCode == 27) {
            delete self.selectedRow;
            delete self.selectedCol;
        }
    }
    this.isValidRow = function($index) {
        if (typeof self.validRow === 'function') {
            return self.validRow($index);
        } else if (self.validRow){
            return self.validRow;
        } else return true;
    }
    function headerRowCount() {
        return self.colHeaders ? (self.showOriginHeader?2:1):0;
    }
    function headerColCount() {
        return self.showOriginHeader?2:1;
    }

  this.getTypeOfAccessor = function([row, col]) {
    let type = typeof self.accessor([row, col]);
    if (type == 'object') {
      return self.accessor([row, col]).type;
    }
    return type;
  }
}
