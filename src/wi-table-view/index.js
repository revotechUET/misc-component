const name = "wiTableView";
module.exports.name = name;

var module = angular.module(name, ['editable']);


module.component(name, {
    style: require('./style.css'),
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
        setter: "<"
    },
});

function Controller($scope, $element) {
    let self = this;
    
    this.$onInit = function() {
        this.colLabels = this.colLabels || {};
        this.rowLabels = this.rowLabels || {};
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
        try {
            if (self.selectedRow !== undefined && self.selectedCol !== undefined) {
                display = 'block';
                let row = $element.find('.row')[self.selectedRow];
                let cell = $(row).find('.cell')[self.selectedCol];
                return {
                    display: 'block',
                    width: cell.clientWidth,
                    height: cell.clientHeight,
                    top: cell.offsetTop,
                    left: cell.offsetLeft 
                }
            }
        }
        catch(e) {
            console.log(e);
            display = 'none';
        }
        return {display};
    }
    this.keyUp = function($event) {
        if ($event.keyCode == 27) {
            delete self.selectedRow;
            delete self.selectedCol;
        }
    }
    function headerRowCount() {
        return self.colHeaders ? (self.showOriginHeader?2:1):0;
    }
    function headerColCount() {
        return self.showOriginHeader?2:1;
    }
}
