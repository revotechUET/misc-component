let helper = require('../DialogHelper');

module.exports = function (ModalService, promptConfig, callback) {
    function ModalController($scope, close) {
        const self = this;
        this.title = promptConfig.title;
        this.inputs = promptConfig.inputs; // multi inputs
        this.inputName = promptConfig.inputName;
        this.input = promptConfig.input;
        // type: [select, text]
        this.type = promptConfig.type;
        this.options = promptConfig.options;
        this.onOkButtonClicked = function () {
            close(self.input || self.inputs);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        template: require("./prompt-modal.html"),
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
