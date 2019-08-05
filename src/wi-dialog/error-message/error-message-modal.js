let helper = require('../DialogHelper');
module.exports = function errorMessageDialog(ModalService, errorMessage, callback, opts) {
    function ModalController($scope, close) {
        let self = this;
        self.opts = opts;
        this.error = errorMessage;
        this.onCloseButtonClicked = function () {
            close(null);
        };
    }

    ModalService.showModal({
        template: require('./error-message-modal.html'),
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (callback) callback();
        })
    });
};
