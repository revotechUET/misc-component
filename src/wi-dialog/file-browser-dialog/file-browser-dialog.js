import helper from '../DialogHelper';

export default function (ModalService, configs = {}, callback) {
    ModalController.$inject = ['close'];
    function ModalController(close) {
        const self = this;
        this.fileManagerUrl = configs.fileManagerUrl || localStorage.getItem('FILE_MANAGER');
        this.filePreviewUrl = configs.filePreviewUrl || localStorage.getItem('FILE_PREVIEW');
        this.storage_database = configs.storage_database || JSON.parse(window.localStorage.getItem('storage_database'));
        this.idProject = configs.idProject;
        this.storage_database.whereami = configs.whereami || "WI_ANGULAR";
        this.setContainer = function(ctrl) {
            ctrl ? self.fileCtrl = ctrl : null;
        }
        this.showMe = true;
        this.files = [];
        this.close = close;
        this.clickFile = configs.clickFile && configs.clickFile.bind(this)
        // this.onOkButtonClicked = function () {
        //     console.log(self.fileCtrl.selectedList);
        //     async.eachSeries(self.fileCtrl.selectedList, (e, next) => {
        //         listTypeAccept.indexOf(e.rootName.split('.').pop().toLowerCase()) != -1 ?
        //             self.fileCtrl.downloadFileToUpload(e)
        //                 .then((file) => {
        //                     self.files.push(file);
        //                     next();
        //                 }) : (() => {__toastr.error(`Don't accept file type ${e.rootName.split('.').pop().toLowerCase()}`); next("File type error");})();
        //     }, (err) => {
        //         if(err) {
        //             self.files = [];
        //             return console.log(err);
        //         }
        //         close(self.files);
        //     })
        // }
        this.onOkButtonClicked = configs.onOkButtonClicked.bind(this);
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        template: require("./file-browser-dialog.html"),
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
