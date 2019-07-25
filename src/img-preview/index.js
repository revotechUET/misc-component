const componentName = 'imgPreview';
const moduleName = 'img-preview';
require('./style.css');

let app = angular.module(moduleName, []);
app.component(componentName, {
    template: require('../img-preview/template.html'),
    controller: Controller,
    controllerAs: componentName,
    bindings: {
        smallImgLink: '<',
        downloadLink: '<',
        fullImgLink: '<',
        data: '<',
        parentElem: '<',
        fxCtrl: '<',
        fileItem: '<',
    }
});

exports.name = moduleName;

function Controller() {
    let self = this;

    self.$onInit = function () {
        preProcess();
    }

    self.imgOnclick = function () {

        const modal = document.getElementById(self._modal);

        modal.style.display = "block";
        //create zoomer
        if (!self.zoomer) self.zoomer = creatZoomer();

    }

    self.closeOnClick = function () {
        const modal = document.getElementById(self._modal);
        self.parentElem.style.display = 'none';
    }

    self.zoomByMouseToggle = function () {
        if (!self.zoomer.isZoomHoverEnable()) {
            //zoom hover
            self.zoomer.enableZoom();
        } else {
            self.zoomer.disableZoom();
        }
    }

    self.getImgByBase64 = function () {
        return `data:image/png;base64, ${self.dataBase64}`
    }

    self.downloadOnClick = function () {
        self.fxCtrl.downloadFile(self.fileItem);

        // console.log(self.downloadFunc());
    }


    function preProcess() {
        self._modal = genUniqueId('modal');
        self._modalImg = genUniqueId('modal-img');
        self._zoomBackground = genUniqueId('zoom-background');
    }

    function genUniqueId(name, src = self.smallImgLink) {
        const now = Date.now().toString();

        return `__${now}-${src}-${name}__`;
    }

    function creatZoomer() {
        const background = document.getElementById(self._zoomBackground);
        const insideImg = document.getElementById(self._modalImg);

        const INSIDE_IMG_SIZE = 90;  //90%
        let zoomRate = 1;

        background.style.backgroundImage = `url('${self.fullImgLink}')`;
        function enableZoom() {
            background.onmousemove = function (e) {
                const zoomer = e.currentTarget;
                let offsetX, offsetY, x, y;


                //make inside img invisible
                // insideImg.style.opacity = 0;
                invisibleImgInside();

                //just change the position of the center of zooming
                //the background-size default is 100%
                //the img-size if 90% //css-file
                //so default is img hide => zoom => change coord of center => zoom custom
                e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX
                e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX
                x = offsetX / zoomer.offsetWidth * 100
                y = offsetY / zoomer.offsetHeight * 100
                zoomer.style.backgroundPosition = x + '% ' + y + '%';
            }

            background.onmouseout = function (e) {
                insideImg.style.opacity = 1;
            }
        }

        function disableZoom() {
            insideImg.style.opacity = 1;
            disableZoomHover();
        }

        function zoomIn() {
            invisibleImgInside();
            if (zoomRate <= 9)++zoomRate;
            const ZOOM_SIZE = zoomRate + INSIDE_IMG_SIZE;
            background.style.backgroundSize = ZOOM_SIZE;

            disableZoomHover();
        }

        function zoomOut() {
            invisibleImgInside();
            if (zoomRate >= 1)--zoomRate;
            const ZOOM_SIZE = zoomRate + INSIDE_IMG_SIZE;
            background.style.backgroundSize = ZOOM_SIZE;
            disableZoomHover();
        }

        function disableZoomHover() {
            background.onmousemove = null;
            background.onmouseout = null;
        }

        function isZoomHoverEnable() {
            return !!(background.onmousemove);
        }

        function invisibleImgInside() {
            insideImg.style.opacity = 0;
        }

        return {
            enableZoom,
            disableZoom,
            zoomIn,
            zoomOut,
            isZoomHoverEnable
        }
    }
}


