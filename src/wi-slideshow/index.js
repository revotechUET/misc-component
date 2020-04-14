var componentName = 'wiSlideshow';

module.exports.name = componentName;

require('./style.less');

var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiSlideshowController,
    controllerAs: 'self',
    bindings: {
        stepPixel: '<',
        styleButton: '<',
        styleMainSlide: '<'
    },
    transclude: true
});
wiSlideshowController.$inject = ['$timeout'];
function wiSlideshowController($timeout) {
    let self = this;
    let left = 0;
    let maxMarginLeft;
    $timeout(()=>{
        let widthContentSlideshow = document.getElementById("content-wi-slideshow").offsetWidth;
        let widthMainSlideshow = document.getElementById("main-wi-slideshow").offsetWidth;
        maxMarginLeft = widthContentSlideshow - widthMainSlideshow + 80;
    })
    this.slideLeft = function () {
        left = left - self.stepPixel;
        if(left > maxMarginLeft*(-1)){
            self.marginLeft = String(left + 'px');
        } else {
            left = left + self.stepPixel;
        }
    }
    this.slideRight = function () {
        left = left + self.stepPixel;
        if(left > 0){
            stopMove = 0;
            self.marginLeft = 0
            left = 0;
        } else {
            stopMove = 0;
            self.marginLeft = String(left + 'px');
        }
    }
}
