let helper = require('../DialogHelper');
module.exports = function (ModalService, options, callback) {
    function ModalController($scope, close) {
        let self = this;

        this.options = options;

        console.log("Op", this.options);
        this.styles = [
        [0, 10],
        [10, 0],
        [2, 2],
        [8, 2],
        [10, 4, 2, 4],
        [10, 4, 2, 4, 2, 4]
        ];
        this.widthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        // this.lineColor = function () {
        //     DialogUtils.colorPickerDialog(ModalService, self.options.lineStyle.lineColor, function (colorStr) {
        //         self.options.lineStyle.lineColor = colorStr;
        //     });
        // }
        this.onOkButtonClicked = function () {
            console.log("optionsss: ", self.options);
            close(self.options);
        };
    }

    ModalService.showModal({
        templateUrl: "line-style-modal.html",
        controller: ModalController,
        controllerAs: "wiModal"
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            if (ret) callback(ret);
        });
    });
}
