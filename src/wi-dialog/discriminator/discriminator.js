import helper from '../DialogHelper';
export default function (ModalService, discrmnt = {}, curvesArr, callback) {
    ModalController.$inject = ['close'];
    function ModalController(close) {
        let self = this;
        this.curvesArr = curvesArr;
        this.conditionTree = discrmnt;
        this.closeModal = function (ret) {
            if (!ret) return close(null);
            close(self.conditionTree);
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
