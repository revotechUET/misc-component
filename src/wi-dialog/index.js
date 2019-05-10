var serviceName = 'wiDialog';
module.exports.name = serviceName;

let app = angular.module(serviceName, ['angularModalService', 'wiTreeView', 'wiToken']);
app.config(function($sceProvider) {
    $sceProvider.enabled(false);
});

app.factory(serviceName, function(ModalService) {
    return new wiDialogService(ModalService);
});

const promptDialog = require("./prompt/prompt-modal.js");
const confirmDialog = require("./confirm/confirm-modal.js");
const imageGaleryDialog = require("./image-galery/image-galery-modal.js");
const imageUploadDialog = require("./image-upload/image-upload-modal.js");

function wiDialogService(ModalService) {
    let self = this;
    this.setDialogUtil = function(dialogUtil) {
        self.DialogUtil = dialogUtil;
    }
    this.promptDialog = function(config, cb) {
        promptDialog(ModalService, config, cb);
    }
    this.confirmDialog = function(title, confirmMessage, cb) {
        confirmDialog(ModalService, title, confirmMessage, cb);
    }
    this.imageGaleryDialog = function(cb) {
        imageGaleryDialog(ModalService, cb);
    }
    this.imageUploadDialog = function(idImage, cb) {
        imageUploadDialog(ModalService, idImage, cb);
    }
}

