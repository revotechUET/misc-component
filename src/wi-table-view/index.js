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
        setter: "<",
        getRowIcons: "<",
        getRowIconStyle: "<",
        validRow: "<",
        rowHeaderCellStyle: '<'
    },
});

function Controller($scope, $element, $compile, $timeout) {
    let self = this;
    const ITEM_HEIGHT = 31;
    const DEFAULT_VLIST_HEIGHT = 190;
    const vListContainerName = '.table-data-container'
    const tableHeaderSelector = '.table-data-header'
    
    $scope.safeApply = function (fn) {
        const phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
            fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    
    this.$onInit = function() {
        this.colLabels = this.colLabels || {};
        this.rowLabels = this.rowLabels || {};
        this.getRowIcons = this.getRowIcons || function() { return [] };
        this.getRowIconStyle = this.getRowIconStyle || function() { return {} };
        $timeout(() => {
            this.vListWrapper = createVirtualListWrapper()
            freezeHeaderWidth()
        })
        self.cellStyle = self.cellStyle || {};
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
    this.getRowByIdx = function(idx) {
        return self.getRows()[idx]
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
        $scope.safeApply()
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

    function createVirtualListWrapper() {
        const height = getVlistHeight()
        const vListWrapper = new WiVirtualList({
            height: height, //initial
            itemHeight: ITEM_HEIGHT,
            htmlContainerElement: $element.find(vListContainerName)[0],
            totalRows: self.getRows().length || 1, //initial
            generatorFn: idxRow => createNodeTreeElement(idxRow)
        });
        vListWrapper.setContainerStyle({
            'border': 'none'
        });
        // vListWrapper.vList.container.addEventListener('scroll', e => $scope.safeApply())
        // vListWrapper.setContainerStyle({display: 'flex'})
        return vListWrapper;
    }

    function getVlistHeight() {
        const h = $element.find(vListContainerName).height();
        return h || self.vlistHeight || DEFAULT_VLIST_HEIGHT;
    }

    function createNodeTreeElement(idxRow) {
        if(idxRow < 0) return document.createElement('div');

        const headerCellWidths = getHeaderCellWidths()
        const labelCellWidths = [headerCellWidths[0]]
        if(self.showOriginHeader) labelCellWidths.push(headerCellWidths[1])

        const dataCellWidths = headerCellWidths.filter((col, idxCol) => idxCol >= labelCellWidths.length)
        self._dataCellWidths = dataCellWidths //allow access in angular template below

        const node = `
        <div class="row" ng-show="self.isValidRow(${idxRow})">
            <div ng-if="self.showOriginHeader" class="cell header " style="width:${labelCellWidths[0]}">
                {{self.getOriginRowHeader(${idxRow})}}
            </div>
            <div class="cell" style="width:${labelCellWidths[labelCellWidths.length - 1]}">
                <div class="cell-col-1">
                    <div class="icon-array">
                        <i ng-style="self.getRowIconStyle(self.getRowByIdx(${idxRow}))" 
                            class="{{icon}}" 
                            ng-repeat="icon in self.getRowIcons(self.getRowByIdx(${idxRow}))">
                        </i>
                    </div>
                    <editable params="${idxRow}" item-value="self.getRowHeader(${idxRow})" set-value="self.setRowHeader"
                        enabled="self.headerEditable"
                        content-style="{width:'100%',height:'100%',float:'none'}">
                    </editable>
                </div>
            </div>
            <div class="cell" 
                ng-repeat="(col, idxCol) in self.getCols(self.getRowByIdx(${idxRow}))" 
                ng-click="self.cellClick(self.getRowByIdx(${idxRow}), col);"
                style="max-width:{{self._dataCellWidths[idxCol]}};width:{{self._dataCellWidths[idxCol]}};"
                ng-attr-title="{{self.accessor([${idxRow}, idxCol])}}">
                <editable 
                    params="[self.getRowByIdx(${idxRow}), col]" 
                    item-value="self.accessor" 
                    set-value="self.setter"
                    enabled="self.cellEditable"
                    content-style="{width:'100%',height:'100%',float:'none'}">
                </editable>
            </div>
        </div>`
        return $compile(node)($scope)[0]
    }

    function getHeaderCellWidths() {
        const headerRowSelector = `${tableHeaderSelector} .row.header`;
        const headerCells = $element.find(headerRowSelector).children();
        const headerWidths = [...headerCells].map(
            headerHtmlEl => window.getComputedStyle(headerHtmlEl).width
        );
        return headerWidths;
    }

    //only using in when component is mounted
    function freezeHeaderWidth() {
        const $cells = $element.find(`${tableHeaderSelector} .cell`)
        for(const $cell of $cells) {
            const curCellWidth = window.getComputedStyle($cell).width
            $cell.style.maxWidth = curCellWidth
        }
    }
}
