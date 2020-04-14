var serviceName = 'wiDialog';
module.exports.name = serviceName;
require('./style.less');
let app = angular.module(serviceName, ['angularModalService', 'wiTreeView', 'wiToken', 'wiLoading', "wiDropdownList", 'wiImportCsvFileNew', 'treeExplorer']);
app.config(['$sceProvider', function($sceProvider) {
    $sceProvider.enabled(false);
}]);

app.factory(serviceName, ['ModalService', function (ModalService) {
    return new wiDialogService(ModalService);
}]);

const errorMessageDialog = require("./error-message/error-message-modal.js");
const promptDialog = require("./prompt/prompt-modal.js");
const confirmDialog = require("./confirm/confirm-modal.js");
const imageGaleryDialog = require("./image-galery/image-galery-modal.js");
const imageUploadDialog = require("./image-upload/image-upload-modal.js");
const importImagesDialog = require('./import-images/import-images-modal.js');
const discriminator = require('./discriminator/discriminator.js');
const lineStyleDialog = require('./line-style/line-style-modal.js');
const colorPickerDialog = require('./color-picker/color-picker-modal.js');
const promptListDialog =require('./prompt-list/prompt-list.js');
const authenticationDialog = require('./authentication/authentication-modal.js');
const csvImportDialog = require('./csv-import/csv-import-modal.js');
const importZoneSet = require('./import-zone-set/import-zone-set.js');
const importMarkerSet = require('./import-marker-set/import-marker-set.js');
const treeExplorer = require('./tree-explorer/tree-explorer.js');
const serverInformation = require('./server-information/server-information.js');
const fileBrowserDialog = require('./file-browser-dialog/file-browser-dialog.js');

function wiDialogService(ModalService) {
    let self = this;
    this.setDialogUtil = function(dialogUtil) {
        self.DialogUtil = dialogUtil;
    }
    this.errorMessageDialog = function(errorMessage, cb, opts) {
        errorMessageDialog(ModalService, errorMessage, cb);
    }
    this.promptDialog = function(config, cb, opts) {
        promptDialog(ModalService, config, cb);
    }
    this.confirmDialog = function(title, confirmMessage, cb, actions) {
        confirmDialog.call(this, ModalService, title, confirmMessage, cb, actions);
    }
    this.imageGaleryDialog = function(cb) {
        imageGaleryDialog(ModalService, cb);
    }
    this.imageUploadDialog = function(idImage, cb) {
        imageUploadDialog.call(this, ModalService, idImage, cb);
    }
    this.importImagesDialog = function(idProject, imgSetName, cb) {
        importImagesDialog.call(this, ModalService, idProject, imgSetName, cb);
    }
    this.discriminator = function(discrmnt, curvesArr, cb) {
        discriminator(ModalService, discrmnt, curvesArr, cb);
    }
	this.lineStyleDialog = function(lineStyle, cb) {
		lineStyleDialog(ModalService, lineStyle, self, cb)
	}
	this.colorPickerDialog = function(curColor, options, cb) {
		colorPickerDialog(ModalService, curColor, options, cb);
	}
    this.promptListDialog = function(config, cb) {
        promptListDialog(ModalService, config, cb);
    }
    this.authenticationDialog = function(cb, options) {
        authenticationDialog(ModalService, cb, options);
    }
    this.csvImportDialog = function(file, cb) {
        csvImportDialog(ModalService, file, cb);
    }
    this.importZoneSet = function(file, idProject, cb) {
        importZoneSet(ModalService, file, idProject, cb);
    }
    this.importMarkerSet = function(file, idProject, cb) {
        importMarkerSet(ModalService, file, idProject, cb);
    }
    this.treeExplorer = function(config, Upload, cb, options) {
        treeExplorer(ModalService, config, Upload, cb, options);
    }
    this.serverInformation = function(config) {
        serverInformation(ModalService, config);
    }
    this.fileBrowserDialog = function(configs, callback) {
        fileBrowserDialog(ModalService, configs, callback);
    }
} 

