let helper = require('../DialogHelper');

module.exports = function (ModalService, serverInformationConfig, callback) {
    function ModalController($scope, close) {
        const self = this;
        this.title = serverInformationConfig.title;
        this.config = serverInformationConfig.config; 
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        template: require("./server-information.html"),
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            ret && callback && callback(ret);
        });
    });
}
