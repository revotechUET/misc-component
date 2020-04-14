let helper = require('../DialogHelper');

module.exports = function (ModalService, idImage, callback) {
    ModalController.$inject = ['$scope', 'wiApi', 'close'];
    function ModalController($scope, wiApi, close) {
        let self = this;
        this.percentage = 0;
        this.getPercentage = function() {
            return parseFloat(this.percentage) || 0;
        }
        this.close = function (ret) {
            close(ret);
        }
        this.upload = function() {
            if (!self.file) return;
            wiApi.uploadImage(self.file, idImage, (imgUrl) => {
                self.imageUrl = imgUrl;
                close(self.imageUrl);
            }, (err) => console.error(err), 
            (percentage) => self.percentage = percentage);
        }
    }

    ModalService.showModal({
        template: require("./image-upload-modal.html"),
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

