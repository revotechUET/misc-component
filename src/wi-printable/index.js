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
        .${cssClassName} ~ .print-cmd-panel {
            position: fixed;
            bottom: 0;
            right: 0;
        }
        .${cssClassName} ~ .print-cmd-panel > button{
            visibility: initial;
        }
    `;
    this.doInit = function() {
        self.orientation = self.orientation || "landscape";
        self.aspectRatio = self.aspectRatio || "4:3";
        self.alignment = self.alignment || "left";
        self.printWidth = self.printWidth || 200; // in millimeters
        self.verticalMargin = self.verticalMargin || 20; // in millimeters
        self.horizontalMargin = self.horizontalMargin || 20; // in millimeters
        self.printElement = self.printElement || ".main-body-center";
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
        self.preWidth = printElem[0].offsetWidth;
        self.preHeight = printElem[0].offsetHeight;

        let styleElem = document.createElement("style");
        self.styleElem = styleElem;
        styleElem.type = "text/css";
        styleElem.appendChild(document.createTextNode(cssText));
        document.head.appendChild(styleElem);

        printElem.addClass(cssClassName);
        printElem.width(wiApi.mmToPixel(self.printWidth));
        let mmHeight = calcPrintHeight(self.printWidth, self.aspectRatio);
        printElem.height(wiApi.mmToPixel(mmHeight));
        self.printElem = printElem;

        const pcpElem = document.createElement('div');
        self.pcpElem = pcpElem;
        $(pcpElem).addClass('print-cmd-panel');
        const pcpContent = `<button ng-click="$ctrl.exitPreview()">Close</button> <button ng-click="$ctrl.doPrint()">Print</button>`;
        $(pcpElem).append($compile(pcpContent)(previewScope));
        printElem.parent()[0].appendChild(pcpElem);
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
        console.log("exit Preview");
        self.styleElem.remove();
        self.pcpElem.remove();
        self.printElem.width(self.preWidth);
        self.printElem.height(self.preHeight);
    }
    this.doPrint = doPrint;
    function doPrint() {
        console.log("doPrint");

        self.pcpElem.remove();
        window.print();
        self.printElem.parent()[0].appendChild(self.pcpElem);
    }
}
