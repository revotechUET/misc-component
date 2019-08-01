var componentName = 'wiPrintLoading';
module.exports.name = componentName;
require('./style.less');
var app = angular.module(componentName, []);

app.component(componentName, {
    template: require('./template.html'),
    controller: wiPrintLoadingController,
    controllerAs: 'self',
    bindings: {
        top:'<',
        bottom:'<',
        right:'<',
        left:'<'
    },
    transclude: true

});

function wiPrintLoadingController($scope) {
    let self = this;
    $(document).ready(function () {
        var st1 = 0, st2 = 0;
        setInterval(function () {
          $(document).find('.p8i-p').hide(0).delay(500).show(0);
        }, 4000);
      });
}
