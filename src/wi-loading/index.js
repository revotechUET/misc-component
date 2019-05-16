var serviceName = 'wiLoading';
module.exports.name = serviceName;
require('./style.less');
let app = angular.module(serviceName, []);
app.factory(serviceName, function ($timeout) {
    return new wiLoadingService($timeout);
});

function wiLoadingService($timeout) {
    let self = this;
    this.show = show;
    this.hide = hide;
    let _spinner = null;
    let _holder = null;

    function show(holder) {
        if (!holder) return;
        _holder = holder;
        _spinner = new Spinner({
            color: '#F16464',
            shadow: false,
            border: false
        });
        _holder.innerHTML = `<div class="wi-loading spinner-background">
            <div class="spinner-backdrop">
                <div class='spinnerHolder'></div>
            </div>
        </div>`;
        $(_holder).find('.spinnerHolder')[0].appendChild(_spinner.spin().el);
    }

    function hide() {
        $timeout(() => {
            if (_spinner) {
                _spinner.stop();
                delete _spinner;
                _spinner = null;
                _holder.removeChild(_holder.childNodes[0]);
            }
        })
    }
}