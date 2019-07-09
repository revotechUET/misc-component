let helper = require('../DialogHelper');

module.exports = function (ModalService, promptConfig, callback) {
    function ModalController($scope, close) {
        const self = this;
        this.title = promptConfig.title;
        this.inputName = promptConfig.inputName;
        this.selectionList = promptConfig.selectionList;
        this.onChange = function(selectedItem) {
            self.selectedItem = selectedItem;
        }
        this.currentSelect = promptConfig.currentSelect;
        this.onOkButtonClicked = function () {
            close(self.selectedItem);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        template: require("./prompt-list.html"),
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
