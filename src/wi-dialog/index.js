var serviceName = 'wiDialog';
module.exports.name = serviceName;

let app = angular.module(serviceName, ['angularModalService']);
app.config(function($sceProvider) {
    $sceProvider.enabled(false);
});

app.factory(serviceName, function(ModalService, $sce) {
    return new wiDialogService(ModalService, $sce);
});

const promptDialog = require("./prompt/prompt-modal.js");
const confirmDialog = require("./confirm/confirm-modal.js");

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
}

