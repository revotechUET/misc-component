let html2canvas = require('../../dist/html2canvas.js');
window.Printable = {
    component: component,
    klass: PrintableCtrl
}
module.exports = {
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
            useBorder: "<",
            verticalMargin: "<",
            horizontalMargin: "<",
            printElement: "@",
            printMode: "<",
            paperSize: "<",
            ...componentData.bindings
        },
        transclude: componentData.transclude || false
    }
}
function PrintableCtrl($scope, $element, $timeout, $compile, wiApi) {
    let self = this;
    let cssClassName = `print-${Date.now()}`;
    const cssText = `
        .${cssClassName} {
            border: 1px solid black !important;
            position: fixed !important;
            z-index: 999;
            top: 25px;
            left: 0;
            visibility: visible;
            background-color: #ffffff;
        }
        .${cssClassName} * {
            visibility: visible;
        }
        * {
            visibility: hidden;
        }
        .${cssClassName} ~ .print-cmd-panel {
            position: fixed;
            top: 0;
            left: 0;
        }
        .${cssClassName} ~ .print-cmd-panel button{
            visibility: initial;
        }
    `;
    let printStyleText;
    this.doInit = function() {
        self.orientation = self.orientation || "landscape";
        self.aspectRatio = self.aspectRatio || "4:3";
        self.alignment = self.alignment || "left";
        self.printWidth = self.printWidth || 200; // in millimeters
        self.verticalMargin = self.verticalMargin || 20; // in millimeters
        self.horizontalMargin = self.horizontalMargin || 15; // in millimeters
        self.printElement = self.printElement || ".printable";
        self.printMode = self.printMode || "image";
        self.paperSize = 'A4';
        self.paperSizeList = [
            // in millimeters
            {data:{label:'A5'}, properties:{name:'A5', width:148, height: 210}},
            {data:{label:'A4'}, properties:{name:'A4', width:210, height: 297}},
            {data:{label:'A3'}, properties:{name:'A3', width:297, height: 420}}
        ],
        self.defaultBindings();
    }
    this.defaultBindings = function() {
        console.error("Default bindings: Abstract function");
    }
    this.print = print;
    function print() {
        preview4Print();
    }
    
    function preview4Print() {
        printStyleText = `
            @page {
                size: ${self.paperSize} ${self.orientation};
                margin: ${self.horizontalMargin}mm;
            }
        `;
        previewScope = $scope.$new();
        previewScope.$ctrl = {
            exitPreview:  exitPreview,
            doPrint: doPrint
        }

        const printElem = $element.find(self.printElement);
        self.printElem = printElem;
        self.originalWidth = printElem[0].offsetWidth;
        self.originalHeight = printElem[0].offsetHeight;
        self.originalMarginTop = printElem[0].style.marginTop;
        self.originalMarginBottom = printElem[0].style.marginBottom;
        self.originalMarginLeft = printElem[0].style.marginLeft;
        self.originalMarginRight = printElem[0].style.marginRight;

        if (self.printMode === 'image') {
            self.printElem[0].style.marginTop = `${self.verticalMargin}mm`;
            self.printElem[0].style.marginBottom = `${self.verticalMargin}mm`;
            self.printElem[0].style.marginLeft = `${self.horizontalMargin}mm`;
            self.printElem[0].style.marginRight = `${self.horizontalMargin}mm`;
        }

        let styleElem = document.createElement("style");
        self.styleElem = styleElem;
        styleElem.type = "text/css";
        styleElem.appendChild(document.createTextNode(cssText));
        document.head.appendChild(styleElem);

        let printStyleElem = document.createElement("style");
        printStyleElem.type = "text/css";
        printStyleElem.setAttribute('media', 'print');
        printStyleElem.appendChild(document.createTextNode(printStyleText));
        document.head.appendChild(printStyleElem);

        printElem.addClass(cssClassName);
        printElem.width(wiApi.mmToPixel(self.printWidth));
        self.printHeight = calcPrintHeight(self.printWidth, self.aspectRatio);
        printElem.height(wiApi.mmToPixel(self.printHeight));

        const pcpElem = document.createElement('div');
        self.pcpElem = pcpElem;
        $(pcpElem).addClass('print-cmd-panel');
        const pcpContent = `
            <div style="height: 25px;">
                <button ng-click="$ctrl.exitPreview()">Close</button>
                <button ng-click="$ctrl.doPrint()">Print</button>
            </div>
        `;
        $(pcpElem).append($compile(pcpContent)(previewScope));
        //$(printElem).prepend(pcpElem);
        printElem.parent()[0].append(pcpElem);
    }
    function calcPrintHeight(w, ratio) {
        switch (ratio) {
            case "4:3":
                return w * 3 / 4;
            case "16:9":
                return w * 9 / 16;
        }
    }
    this.exitPreview = exitPreview;
    function exitPreview() {
        self.styleElem.remove();
        self.pcpElem.remove();
        self.printElem.width(self.originalWidth);
        self.printElem.height(self.originalHeight);
        self.printElem[0].style.marginTop = self.originalMarginTop;
        self.printElem[0].style.marginBottom = self.originalMarginBottom;
        self.printElem[0].style.marginLeft = self.originalMarginLeft;
        self.printElem[0].style.marginRight = self.originalMarginRight;
    }
    this.doPrint = doPrint;
    function doPrint() {
        switch(self.printMode) {
            case "image":
                self.pcpElem.remove();
                html2canvas(self.printElem[0], {
                    allowTaint: true,
                    foreignObjectRendering:true,
                    x: (self.printElem[0].offsetLeft - wiApi.mmToPixel(self.horizontalMargin)) / 2,
                    y: (self.printElem[0].offsetTop - wiApi.mmToPixel(self.verticalMargin)) / 2,
                    scale: 1,
                    width: _.max([
                        self.printElem[0].scrollWidth,
                        self.printElem[0].offsetWidth,
                        self.printElem[0].clientWidth
                    ]) + wiApi.mmToPixel(self.horizontalMargin) * 2,
                    height: _.max([
                        self.printElem[0].scrollHeight,
                        self.printElem[0].offsetHeight,
                        self.printElem[0].clientHeight
                    ]) + wiApi.mmToPixel(self.verticalMargin) * 2
                }).then(canvas => {
                    let image = new Image();
                    image.src = canvas.toDataURL("image/png");

                    let a = document.createElement('a');
                    a.addEventListener('click', function(ev) {
                        a.href = image.src;
                        a.download = "mypainting.png";
                    }, false);
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    let w = window.open("");
                    w.document.write(image.outerHTML);
                    w.document.close();
                })
                self.printElem.parent()[0].append(self.pcpElem);
                break;
            case "pdf":
                self.pcpElem.remove();
                window.print();
                self.printElem.parent()[0].append(self.pcpElem);
                break;
        }
    }

    this.setPrintWidth = setPrintWidth;
    function setPrintWidth(notUse, newValue) {
        self.printWidth = parseFloat(newValue);
    }

    this.onZonesetSelectionChanged = onZonesetSelectionChanged;
    function onZonesetSelectionChanged(selectedItemProps) {
        self.paperSize = (selectedItemProps || {}).name;
    }
}
