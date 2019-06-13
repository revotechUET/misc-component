let helper = require('../DialogHelper');
let colorPickerDialog = require('../color-picker/color-picker-modal.js');

module.exports = function (ModalService, options, callback) {
    function ModalController($scope, close) {
		let self = this;

        this.options = options;

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
			console.log('---chosing color');
			// colorPickerDialog(ModalService, self.options.lineStyle.lineColor, function (colorStr) {
			// 	self.options.lineStyle.lineColor = colorStr;
			// });
        }
        this.onOkButtonClicked = function () {
            close(self.options);
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
