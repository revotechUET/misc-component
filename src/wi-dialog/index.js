var serviceName = 'wiDialog';
export const name = serviceName;
require('./style.less');
let app = angular.module(serviceName, ['angularModalService', 'wiTreeView', 'wiToken', 'wiLoading', "wiDropdownList", 'wiImportCsvFileNew', 'treeExplorer']);
app.config(['$sceProvider', function($sceProvider) {
    $sceProvider.enabled(false);
}]);

app.factory(serviceName, ['ModalService', function (ModalService) {
    return new wiDialogService(ModalService);
}]);

import errorMessageDialog from "./error-message/error-message-modal.js";
import promptDialog from "./prompt/prompt-modal.js";
import confirmDialog from "./confirm/confirm-modal.js";
import imageGaleryDialog from "./image-galery/image-galery-modal.js";
import imageUploadDialog from "./image-upload/image-upload-modal.js";
import importImagesDialog from './import-images/import-images-modal.js';
import discriminator from './discriminator/discriminator.js';
import lineStyleDialog from './line-style/line-style-modal.js';
import colorPickerDialog from './color-picker/color-picker-modal.js';
import promptListDialog from './prompt-list/prompt-list.js';
import authenticationDialog from './authentication/authentication-modal.js';
import csvImportDialog from './csv-import/csv-import-modal.js';
import importZoneSet from './import-zone-set/import-zone-set.js';
import importMarkerSet from './import-marker-set/import-marker-set.js';
import treeExplorer from './tree-explorer/tree-explorer.js';
import serverInformation from './server-information/server-information.js';
import fileBrowserDialog from './file-browser-dialog/file-browser-dialog.js';

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

