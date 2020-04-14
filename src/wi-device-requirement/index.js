var componentName = 'wiDeviceRequirement';
module.exports.name = componentName;
require('./style.less');
var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiDeviceRequirementController,
    controllerAs: 'self',
    bindings: {
        minWidth: '<',
        minHeight: '<'
    }
});
wiDeviceRequirementController.$inject = ['$scope', '$timeout'];
function wiDeviceRequirementController($scope,$timeout) {
    let self = this;
  
    window.onresize = function(event) {
        let w = $(window).width();
        let h = $(window).height();
        checkDevice(w, h, self.minWidth, self.minHeight, self.notCheckDeviceRequirement)
    };
    
    this.$onInit = function() {
        checkDevice($(window).width(),  $(window).height(), self.minWidth, self.minHeight)
    }
    //w: width
    //mw: minwidth
    //mh: minHeight
    //nc: notCheck
    function checkDevice(w, h, mw, mh, nc){
        if(nc) return;
        if(w < mw || h < mh) {
            $timeout(()=>{ 
                self.title = "Browser Window too small!";
                self.discription = "This may affect the interface. Please enlarge the browser window."
                self.showDeviceRequirement = true;
            })
        }
        else if(w >= mw && h >= mh) {
            $timeout(()=>{
                self.showDeviceRequirement = false;
            })
        }
    }
}
