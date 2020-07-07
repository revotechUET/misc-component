import helper from '../DialogHelper';

export default function (ModalService, idImage, callback, idProject) {
    ModalController.$inject = ['$scope', 'wiApi', 'wiDialog','close'];
    function ModalController($scope, wiApi, wiDialog, close) {
        let self = this;
        this.arrayAccept = ['jpg', 'png']
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
        this.selectFromPDB = function() {
            wiDialog.fileBrowserDialog({
                idProject: idProject,
                storage_database: JSON.parse(window.localStorage.getItem('storage_database')),
                whereami: "WI_ANGULAR",
                onOkButtonClicked: function() {
                    const ModalCtrl =  this;
                    if(!this.selectedNode) {
                        if(__toastr) __toastr.error(`Please select image to upload`)
                        return null
                    }
                    if(!self.arrayAccept.includes(ModalCtrl.selectedNode.rootName.split('.').pop())) {
                        if(__toastr) __toastr.error(`Only accept image type`)
                        return null
                    }
                    ModalCtrl.fileCtrl.downloadFileToUpload(ModalCtrl.selectedNode)
                    .then(file => {
                        file = new File([file], file.name, {type: 'image', lastModified: Date.now()})
                        ModalCtrl.close(file)
                    })
                },
                clickFile: function(items) {
                    if(!items.length) {
                        this.selectedNode = null
                    }
                    this.selectedNode = items[0]
                }
            }, function(file) {
                self.file = file
            })
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

