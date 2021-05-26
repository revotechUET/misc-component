import './print-settings';
import html2canvas from '../../vendor/html2canvas.js';
import jsPDF from '../../vendor/jspdf.debug.js';
import pdfMake from '../../vendor/pdfmake';

window.Printable = {
    component: component,
    klass: PrintableCtrl
}
export default {
    component: component,
    klass: PrintableCtrl
}
function component(componentData) {
    return {
        controller: componentData.controller,
        controllerAs: componentData.controllerAs || 'self',
        templateUrl: componentData.templateUrl,
        template: componentData.template,
        bindings: {
            orientation: "<",
            aspectRatio: "<",
            alignment: "<",
            printWidth: "<",
            printHeight: "<",
            useBorder: "<",
            verticalMargin: "<",
            horizontalMargin: "<",
            printElement: "@",
            printMode: "<",
            paperSize: "<",
            isFitWidth: "<",
            isPageBreak: "<",
            showCtrlPage: "<",
            ...componentData.bindings
        },
        transclude: componentData.transclude || false
    }
}
function PrintableCtrl($scope, $element, $timeout, $compile, wiApi, wiLoading) {
    let self = this;
    this.cssClassName = `print-${Date.now()}`;
    let pcpElemHeight = "25px";
    const cssText = `
        .printable-wrapper {
            position: fixed !important;
            z-index: 999;
            top: 0;
            left: 0;
            visibility: visible;
            height: 100vh;
            width: unset;
            overflow: auto;
        }
        .${self.cssClassName} {
            position: relative;
            top: ${pcpElemHeight};
            margin-bottom: ${pcpElemHeight};
            background-color: #ffffff;
        }
        .${self.cssClassName} * {
            visibility: visible;
        }
        * {
            visibility: hidden;
        }
        .${self.cssClassName} ~ .print-cmd-panel {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 99;
        }
        .${self.cssClassName} ~ .print-cmd-panel * {
            visibility: initial;
        }
        .modal.fade, .modal *, wi-spinner *, #toast-container, #toast-container * {
          visibility: visible;
        }
    `;

    this.getPDFjs = function() {
        return jsPDF;
    }
    this.getPDFMake = function() {
        return pdfMake;
    }
    this.getCssText = getCssTextDefault;
    this.getCssTextDefault = getCssTextDefault;
    function getCssTextDefault() {
        return cssText;
    }
    let printStyleText;
    this.doInit = function() {
        self.pageIdx = 0;
        self.orientation = self.orientation || "portrait";
        self.aspectRatio = self.aspectRatio || "4:3";
        self.alignment = self.alignment || "left";
        self.printWidth = self.printWidth || 210; // in millimeters
        self.printHeight = self.printHeight || 297; // in millimeters
        self.verticalMargin = self.verticalMargin || 0; // in millimeters
        self.horizontalMargin = self.horizontalMargin || 0; // in millimeters
        self.printElement = self.printElement || ".printable";
        self.printMode = self.printMode || "pdf";
        self.paperSize = 'A4';
        self.paperSizeList = [
            // in millimeters
            {data:{label:'Customize'}, properties:{name:'Customize'}},
            {data:{label:'A0'}, properties:{name:'A0', width:841, height: 1189}},
            {data:{label:'A1'}, properties:{name:'A1', width:594, height: 841}},
            {data:{label:'A2'}, properties:{name:'A2', width:420, height: 594}},
            {data:{label:'A3'}, properties:{name:'A3', width:297, height: 420}},
            {data:{label:'A4'}, properties:{name:'A4', width:210, height: 297}},
            {data:{label:'A5'}, properties:{name:'A5', width:148, height: 210}},
            {data:{label:'A6'}, properties:{name:'A6', width:105, height: 148}},
            {data:{label:'A7'}, properties:{name:'A7', width:74, height: 105}},
            {data:{label:'A8'}, properties:{name:'A8', width:52, height: 74}},
            {data:{label:'A9'}, properties:{name:'A9', width:37, height: 52}},
            {data:{label:'A10'}, properties:{name:'A10', width:26, height: 37}}
        ];
        self.aspectRatioList = ['4:3', '16:9'];
        self.isFitWidth = self.isFitWidth !== undefined ? self.isFitWidth : false;
        self.isPageBreak = self.isPageBreak !== undefined ? self.isPageBreak : false;
        self.showCtrlPage = self.showCtrlPage !== undefined ? self.showCtrlPage : false;
        self.defaultBindings();
    }
    this.defaultBindings = function() {
        console.error("Default bindings: Abstract function");
    }
    this.print = print;
    function print() {
        self.preview4Print();
    }
    this.onPaperSizeChange = onPaperSizeChange;
    function onPaperSizeChange(selectedItemProps) {
        self.paperSize = (selectedItemProps || {}).name;
    }
    this.preview4Print = preview4PrintDefault;
    function preview4PrintDefault() {
        const printElem = $element.find(self.printElement);
        printElem.wrapAll('<div class="printable-wrapper"></div>');
        self.printElem = printElem;
        self.originalWidth = printElem[0].offsetWidth;
        self.originalHeight = printElem[0].offsetHeight;
        if (self.printMode === 'image') {
            self.originalMarginTop = printElem[0].style.marginTop;
            self.originalMarginBottom = printElem[0].style.marginBottom;
            self.originalMarginLeft = printElem[0].style.marginLeft;
            self.originalMarginRight = printElem[0].style.marginRight;
            self.printElem[0].style.marginTop = `${self.verticalMargin}mm`;
            self.printElem[0].style.marginBottom = `${self.verticalMargin}mm`;
            self.printElem[0].style.marginLeft = `${self.horizontalMargin}mm`;
            self.printElem[0].style.marginRight = `${self.horizontalMargin}mm`;
        }
        let styleElem = document.createElement("style");
        self.styleElem = styleElem;
        styleElem.type = "text/css";
        styleElem.appendChild(document.createTextNode(self.getCssText()));
        document.head.appendChild(styleElem);
        printElem.addClass(self.cssClassName);
        printElem.width(self.calcPrintWidth(self.printWidth, printElem));
        printElem.height(self.calcPrintHeight(self.printWidth, self.aspectRatio, printElem));
        const pcpElem = document.createElement('div');
        self.pcpElem = pcpElem;
        $(pcpElem).addClass('print-cmd-panel');
        const previewScope = $scope.$new();
        previewScope._pageIdx = 1;
        previewScope.$ctrl = self;
        const pcpContent = `
            <div style="height: ${pcpElemHeight};background:#fff">
                <span>{{$ctrl.getPrintInfo()}}</span>
                <button ng-click="$ctrl.exitPreview()">Close</button>
                <button ng-click="$ctrl.doPrint()" ng-if="!$ctrl.showCtrlPage || $ctrl.isPageBreak">Print</button>
                <div style="display: inline-block;"
                ng-if="$ctrl.showCtrlPage">
                    <button ng-click="$ctrl.doPrintAll($ctrl, 'download')">Print All</button>
                    <button ng-click="$ctrl.doPrintAll($ctrl, 'save')">Save to DB</button>
                    <button ng-click="$ctrl.firstPage($ctrl)">First Page</button>
                    <button ng-click="$ctrl.previousPage($ctrl)">Previous</button>
                    <editable style="display:inline-block;" enabled='true' item-value="$ctrl.getPageIdx" set-value="$ctrl.setPageIdx" content-style='{
                        float: "none",
                        display: "inline-block",
                        width: "50px",
                        "text-align": "center"
                    }'></editable>
                    <button ng-click="$ctrl.nextPage($ctrl)">Next</button>
                    <button ng-click="$ctrl.lastPage($ctrl)">Last Page</button>
                </div>
            </div>
        `;
        //`<input ng-model="_pageIdx" ng-change="$ctrl.pageIdx = _pageIdx - 1; $ctrl.goToPage($ctrl)" ng-model-options="{updateOn: 'change'}">`
        $(pcpElem).append($compile(pcpContent)(previewScope));
        printElem.parent()[0].append(pcpElem);
    }
    this.getPageIdx = function() {
        return 0;
    }

    this.setPageIdx = (notUsed, newVal) => {
        return;
    }
    this.previousPage = function() {
        console.log('previous page');
    }
    this.nextPage = function() {
        console.log('next page');
    }
    this.getPrintInfo = function() {
        return;
    } 
    this.goToPage = function(pageIdx) {
        return;
    }
    this.lastPage = function() {
        return;
    }
    this.firstPage = function() {
        return;
    }
    this.calcPrintHeightMM = calcPrintHeightMMDefault;
    function calcPrintHeightMMDefault(w, ratio, htmlElem) {
        switch (ratio) {
            case "4:3":
                return w * 3 / 4;
            case "16:9":
                return w * 9 / 16;
        }
    }
    this.calcPrintHeight = calcPrintHeightDefault;
    function calcPrintHeightDefault(w, ratio, htmlElem) {
        if (self.paperSize == "Customize")
            return wiApi.mmToPixel(self.printHeight);
        return wiApi.mmToPixel(calcPrintHeightMMDefault(w, ratio, htmlElem));
    }

    this.calcPrintWidth = calcPrintWidthDefault;
    function calcPrintWidthDefault(w, htmlElem) {
        if (self.isFitWidth) return wiApi.mmToPixel(getPaperSizeDefault(self.paperSize).width - self.horizontalMargin * 2)
        return wiApi.mmToPixel(w);
    }
    this.exitPreview = exitPreview;
    function exitPreview() {
        self.styleElem.remove();
        self.pcpElem.remove();
        self.printElem.width(self.originalWidth);
        self.printElem.height(self.originalHeight);
        self.printElem.unwrap();
        if (self.printMode === 'image') {
            self.printElem[0].style.marginTop = self.originalMarginTop;
            self.printElem[0].style.marginBottom = self.originalMarginBottom;
            self.printElem[0].style.marginLeft = self.originalMarginLeft;
            self.printElem[0].style.marginRight = self.originalMarginRight;
        }
    }
    async function html2Canvas(htmlElem, config, callback) {
        const canvases = []
        canvases.push(await html2canvas(htmlElem, {
            allowTaint: true,
            foreignObjectRendering: true,
            // x: -wiApi.mmToPixel(self.horizontalMargin) / 2,
            // y: -wiApi.mmToPixel(self.verticalMargin) / 2,
            // scale: 1,
            // width: _.max([
            //     htmlElem.scrollWidth,
            //     htmlElem.offsetWidth,
            //     htmlElem.clientWidth
            // ]) + wiApi.mmToPixel(self.horizontalMargin) * 2,
            // height: _.max([
            //     htmlElem.scrollHeight,
            //     htmlElem.offsetHeight,
            //     htmlElem.clientHeight
            // ]) + wiApi.mmToPixel(self.verticalMargin) * 2,
            ...config
        }));
        callback && callback(canvases)
    }
    this.exportAsImage = exportAsImage;
    function exportAsImage(newConfig = {}, callback) {
        let defaultConfig = {};
        let config = {...defaultConfig, ...newConfig};
        let cb = callback || function(canvas) {
            let a = document.createElement('a');
            a.addEventListener('click', function(ev) {
                a.href = canvas.toDataURL("image/png");
                a.download = `${(self.getConfigTitle && self.getConfigTitle())
                        || 'myPNG'}.png`;
            }, false);
            document.body.appendChild(a);
            a.click();
            a.remove();
            //let image = new Image();
            //image.src = canvas.toDataURL("image/png");
            //let w = window.open("");
            //w.document.write(image.outerHTML);
            //w.document.close();
        }
        self.printElem[0].style.top = 0;
        html2Canvas(self.printElem[0], config, cb);
        self.printElem[0].style.top = pcpElemHeight;
    }
    this.getCorrectJsPdfFormat = function(unit, width, height) {
        let k;
        switch (unit) {
            case 'pt':  k = 1;          break;
            case 'mm':  k = 72 / 25.4;  break;
            case 'cm':  k = 72 / 2.54;  break;
            case 'in':  k = 72;         break;
            case 'px':  k = 96 / 72;    break;
            case 'pc':  k = 12;         break;
            case 'em':  k = 12;         break;
            case 'ex':  k = 6;          break;
            default:
                throw ('Invalid unit: ' + unit);
        }
        return [width * k, height * k];
    }
    this.exportAsPDF = exportAsPDF;
    function exportAsPDF(newConfig = {}, callback) {
        // let imgWidth = self.calcPrintWidth(self.printWidth, self.printElem);
        // let maxViewWidth = wiApi.mmToPixel(getPaperSizeDefault(self.paperSize).width - self.horizontalMargin * 2);
        // let imgHeight = self.calcPrintHeight(self.printWidth, self.aspectRatio, self.printElem);
        // let maxViewHeight = wiApi.mmToPixel(getPaperSizeDefault(self.paperSize).height - self.verticalMargin * 2);
        let cb = callback || function (canvases) {
            let pdf = new jsPDF(self.orientation, 'mm', self.paperSize.toLowerCase());
            for (const canvas of canvases) {
                let imgData = canvas.toDataURL("image/png");
                pdf.addImage(
                    imgData, 'PNG',
                    self.horizontalMargin,
                    self.verticalMargin
                );
            }
            pdf.save(`${(self.getConfigTitle && self.getConfigTitle())
                        || 'myPDF'}.pdf`);
        }
        self.printElem[0].style.top = 0;
        //let defaultConfig = {x: 0, y: 0,
            //width: _.min([imgWidth, maxViewWidth]) + 3,
            //height: _.min([imgHeight, maxViewHeight]) + 3
        //};
        //let defaultConfig = {x: 0, y: 0};
        let defaultConfig = {x: self.printElem[0].offsetLeft / 2, y: 0};
        let config = {...defaultConfig, ...newConfig};
        html2Canvas(self.printElem[0], config, cb)
        self.printElem[0].style.top = pcpElemHeight;
    }
    this.getPaperSizeDefault = getPaperSizeDefault;
    function getPaperSizeDefault(paperName) {
        let page = self.paperSizeList.find(psl => psl.properties.name === paperName).properties;
        if (self.printMode === 'pdf' && self.orientation === 'landscape') return {height: page.width, width: page.height};
        return page;
    }
    this.doPrintAll = doPrintAll;
    function doPrintAll() {
        console.log('doPrintAll');
    }
    this.doPrint = doPrint;
    function doPrint(html2CanvasConfig, callback) {
        switch(self.printMode) {
            case "image":
                exportAsImage(html2CanvasConfig, callback);
                break;
            case "pdf":
                exportAsPDF(html2CanvasConfig, callback);
                break;
        }
    }
    this.setPrintWidth = setPrintWidth;
    function setPrintWidth(notUse, newValue) {
        self.printWidth = parseFloat(newValue);
    }
    this.setPrintHeight = setPrintHeight;
    function setPrintHeight(notUse, newValue) {
        self.printHeight = parseFloat(newValue);
    }
    this.setVerticalMargin = setVerticalMargin;
    function setVerticalMargin(notUse, newValue) {
        self.verticalMargin = parseFloat(newValue);
    }
    this.setHorizontalMargin = setHorizontalMargin;
    function setHorizontalMargin(notUse, newValue) {
        self.horizontalMargin = parseFloat(newValue);
    }
    this.changeAspectRatio = changeAspectRatio;
    function changeAspectRatio(aspectRatio) {
        self.aspectRatio = aspectRatio;
    }
    this.onZonesetSelectionChanged = onZonesetSelectionChanged;
    function onZonesetSelectionChanged(selectedItemProps) {
        self.paperSize = (selectedItemProps || {}).name;
    }
}
