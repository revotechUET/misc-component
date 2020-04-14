let helper = require('../DialogHelper');

module.exports = function (ModalService, lineStyle, wiDialog, callback) {
    ModalController.$inject = ['close'];
    function ModalController(close) {
		let self = this;

        this.lineStyle = lineStyle;

        this.styles = [
        [0, 10],
        [10, 0],
        [2, 2],
        [8, 2],
        [10, 4, 2, 4],
        [10, 4, 2, 4, 2, 4]
        ];
        this.widthes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        this.lineColor = function () {
			wiDialog.colorPickerDialog(self.lineStyle.lineColor, {}, function (colorStr) {
				self.lineStyle.lineColor = colorStr;
			});
        }
        this.onOkButtonClicked = function () {
            close(self.lineStyle);
        };
		this.onCancelButtonClicked = () => {
			close(null);
		}
    }

    ModalService.showModal({
        template: require("./line-style-modal.html"),
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
