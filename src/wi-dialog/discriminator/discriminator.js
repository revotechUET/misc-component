let helper = require('../DialogHelper');
module.exports = function (ModalService, callback) {
    function ModalController(close) {
        this.closeModal = function () {
            close(null);
        }
    }
    ModalService.showModal({
        template: require("./discriminator.html"),
        controller: ModalController,
        controllerAs: 'self'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            ret && callback && callback(ret);
        });
    });
}