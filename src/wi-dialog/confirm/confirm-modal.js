import helper from '../DialogHelper';

export default function (ModalService, titleMessage, confirmMessage, callback, actions) {
    ModalController.$inject = ['$scope', 'close'];
    function ModalController($scope, close) {
        this.title = titleMessage || 'Confirm';
        this.confirmMsg = confirmMessage;
        this.actions = actions;
        this.close = function (ret) {
            close(ret);
        }
    }

    ModalService.showModal({
        template: require("./confirm-modal.html"),
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            callback && callback(ret);
        });
    });
}
