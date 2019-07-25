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
            position: fixed !important;
            z-index: 999;
            top: 0;
            left: 0;
        }
        .${cssClassName} * {
            visibility: visible;
        }
        * {
            visibility: hidden;
        }
        .${cssClassName} > .print-cmd-panel {
            position: fixed;
            top: 0;
            left: 0;
        }
        .${cssClassName} > .print-cmd-panel > button{
            visibility: initial;
        }
    `;
    const printStyleText = `
        @page {
            size: A4 landscape;
            margin: 5px;
        }
        html, body {
            width: 200px ;
        }
    `
    this.doInit = function() {
        self.orientation = self.orientation || "landscape";
        self.aspectRatio = self.aspectRatio || "4:3";
        self.alignment = self.alignment || "left";
        self.printWidth = self.printWidth || 200; // in millimeters
        self.printHeight = calcPrintHeight(self.printWidth, self.aspectRatio);
        self.verticalMargin = self.verticalMargin || 20; // in millimeters
        self.horizontalMargin = self.horizontalMargin || 20; // in millimeters
        self.printElement = self.printElement || ".main-body-center";
        self.printMode = self.printMode || "image";
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
        previewScope = $scope.$new();
        previewScope.$ctrl = {
            exitPreview:  exitPreview,
            doPrint: doPrint
        }

        const printElem = $element.find(self.printElement);
        self.originalWidth = printElem[0].offsetWidth;
        self.originalHeight = printElem[0].offsetHeight;

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
        printElem.height(wiApi.mmToPixel(self.printHeight));
        self.printElem = printElem;

        const pcpElem = document.createElement('div');
        self.pcpElem = pcpElem;
        $(pcpElem).addClass('print-cmd-panel');
        const pcpContent = `<button ng-click="$ctrl.exitPreview()">Close</button> <button ng-click="$ctrl.doPrint()">Print</button>`;
        $(pcpElem).append($compile(pcpContent)(previewScope));
        $(printElem).prepend(pcpElem);
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
    }
    this.doPrint = doPrint;
    function doPrint() {
        switch(self.printMode) {
            case "image":
                html2canvas(self.printElem[0]).then(canvas => {
                    console.log(canvas);
                })
                break;
            case "printer":
                self.pcpElem.remove();
                window.print();
                $(self.printElem).prepend(self.pcpElem);
                break;
        }
    }
}
