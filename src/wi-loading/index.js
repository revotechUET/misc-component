var serviceName = 'wiLoading';
module.exports.name = serviceName;
require('./style.less');
let app = angular.module(serviceName, []);
app.factory(serviceName, ['$timeout', function ($timeout) {
    return new wiLoadingService($timeout);
}]);

function wiLoadingService($timeout) {
    let self = this;
    this.show = show;
    this.hide = hide;
    let _spinner = null;
    let _holder = null;

    function show(holder, silent) {
        if(silent) return;
        if (!holder) return;
        _holder = holder;
        _spinner = new Spinner({
            color: '#F16464',
            shadow: false,
            border: false
        });
        let div = document.createElement('div');
        div.setAttribute('class', 'wi-loading spinner-background');
        _holder.appendChild(div);
        div.innerHTML = `<div class="spinner-backdrop">
                <div class='spinnerHolder'></div>
            </div>`;
        $(_holder).find('.spinnerHolder')[0].appendChild(_spinner.spin().el);
    }

    function hide() {
        if (_spinner) {
            _spinner.stop();
            delete _spinner;
            _spinner = null;
            $(_holder).find('.wi-loading').remove();
        }
    }
}