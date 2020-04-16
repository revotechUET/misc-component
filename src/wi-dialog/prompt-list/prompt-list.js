import helper from '../DialogHelper';

export default function (ModalService, promptConfig, callback) {
    ModalController.$inject = ['close'];
    function ModalController(close) {
        const self = this;
        this.title = promptConfig.title;
        this.inputName = promptConfig.inputName;
        this.selectionList = promptConfig.selectionList;
        this.hideButtonDelete = promptConfig.hideButtonDelete;
        this.onCtrlBtnClick = promptConfig.onCtrlBtnClick;
        this.iconBtn = promptConfig.iconBtn;
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
