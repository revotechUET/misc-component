import helper from '../DialogHelper';
export default function (ModalService, idProject, imgSetName, callback) {
    const wiDialog = this;
    ModalController.$inject = ['$timeout', '$element', 'wiApi', 'close', 'wiLoading'];
    function ModalController($timeout, $element, wiApi, close, wiLoading) {
        const self = this;
        self.selectedIdx = -1;
        self.selectedUnit = 'm';
        this.imgSetName = imgSetName;
        this.uploadedImages = [];
        this.selectedImage = null;
        this.selected = false;
        this.imageUrl = "";
        this.showImage = false;
        this.uploadFileList = [];
        this.arrayPattern = [];
        this.patterns = ['WELLNAME', 'TOPDEPTH', 'BOTDEPTH'];
        // this.patterns = ['WELLNAME','FILL','DEPTH','UNIT','SPEC','TOPDEPTH','BOTDEPTH','RIGHT','LEFT'];
        this.inputPattern = '';
        this.inputWellName = '';
        this.wells = null;
        this.maxInterval = 0;
        this.initWellList = function(wiDropdownCtrl) {
            wiApi.getWellsPromise(idProject).then(wells => {
                self.wells = wells;
                wiDropdownCtrl.items = wells.map(well => ({
                    data: {
                        label: well.name,
                        title: well.name,
                        name: well.name
                    },
                    properties: well
                }));
            }).catch(err => console.error(err));
        }
        this.onWellChanged = function(selectedWellProps) {
            self.inputWellName = selectedWellProps.name;
        }
        // wiApi.getWellsPromise(idProject).then(wells => self.wells = wells).catch(err => console.error(err));

        function getImageName(img) {
            let _DIVIDER;
            if (img.match('/') != null) {
                _DIVIDER = '/';
            } else {
                _DIVIDER = '\\';
            }
            return img.split(_DIVIDER).pop();
        }
        /*
        this.selectImage = function (image) {
            self.selectedImage = image;
            self.selected = true;
            self.imageUrl = image.imageUrl;
            self.done = true;
            // self.arePropsChanged = true;
        }
        */
        this.selectUnit = function (unit) {
            self.selectedUnit = unit;
        }
        this.setImgSetName = function (notuse, name) {
            self.imgSetName = name;
        }
        this.focusPatternList = function () {
            $timeout(() => $element.find('.pattern-list')[0].focus(), 100);
        }
        this.selectPattern = function (pattern) {
            if (this.inputPattern) {
                if (this.inputPattern[this.inputPattern.length - 1] == '%') {
                    this.inputPattern += pattern + '%';
                } else this.inputPattern += '%' + pattern + '%';
            } else {
                this.inputPattern += '%' + pattern + '%';
            }
            this.updateInformation();
        }
        this.addForUpload = function (files) {
            if (files && files.length) {
                for (let i in files) {
                    preProcessImage(files[i], this.inputPattern);
                    files[i].uploaded = false;
                    this.uploadFileList.push(files[i]);
                    // console.log(this.uploadFileList);
                }
            }
        }
        const listTypeAccept = ['png', 'jpg'];
        this.addForUploadPDB = function() {
            wiDialog.fileBrowserDialog({
                fileManagerUrl: localStorage.getItem('FILE_MANAGER'),
                filePreviewUrl: localStorage.getItem('FILE_PREVIEW'),
                storage_database: JSON.parse(window.localStorage.getItem('storage_database')),
                idProject: idProject,
                whereami: "WI_ANGULAR",
                onOkButtonClicked: function() {
                    console.log(this.fileCtrl.selectedList);
                    async.eachSeries(this.fileCtrl.selectedList, (e, next) => {
                        listTypeAccept.indexOf(e.rootName.split('.').pop().toLowerCase()) != -1 ?
                            this.fileCtrl.downloadFileToUpload(e)
                                .then((file) => {
                                    this.files.push(file);
                                    next();
                                }) : (() => {__toastr.error(`Don't accept file type ${e.rootName.split('.').pop().toLowerCase()}`); next("File type error");})();
                    }, (err) => {
                        if(err) {
                            this.files = [];
                            return console.log(err);
                        }
                        this.close(this.files);
                    })
                }
            }, function(files) {
                console.log(files);
                if (files && files.length) {
                    for (let i in files) {
                        preProcessImage(files[i], self.inputPattern);
                        files[i].uploaded = false;
                        self.uploadFileList.push(files[i]);
                        // console.log(this.uploadFileList);
                    }
                }
            })
        }
        this.updateInformation = function () {
            for (let i in this.uploadFileList) {
                for (let j in this.uploadFileList[i].information.arrayPattern) {
                    delete this.uploadFileList[i].information[this.uploadFileList[i].information.arrayPattern[j]];
                    delete this.uploadFileList[i].information.MORE;
                }
                this.uploadFileList[i].information.arrayPattern = [];
                processUpdate(this.uploadFileList[i], this.inputPattern)
                // console.log(this.uploadFileList[i]);

                // this.inputPattern.search("WELLNAME");

            }
        }
        this.clearUpload = function () {
            this.uploadFileList.length = 0;
        }
        this.removeFromUpload = function (index) {
            this.uploadFileList.splice(index, 1);
            this.showImage = false;
        }
        this.uploadFiles = function () {
            doUploadFiles(this.uploadFileList, function (success) {
                wiLoading.hide();
                if (success) {
                    self.uploadFileList = [];
                    self.showImage = false;
                    self.closeModal();
                    __toastr && __toastr.success("Images upload successfull");
                }
            });
        }
        let askedCached = {};
        function askedAlready(imageSetName) {
            if (!askedCached[imageSetName]) {
                askedCached[imageSetName] = true;
                return false;
            }
            return true;
        }
        function resetAskedCache() {
            askedCached = {};
        }
        async function doUploadFiles(files, callback) {
            wiLoading.show($element.find('.modal-dialog')[0]);
            resetAskedCache();
            let newFiles = files.sort(function (f1, f2) {
                return parseFloat(f1.information.TOPDEPTH) - parseFloat(f2.information.TOPDEPTH);
            });
            async.eachOfSeries(newFiles, function (file, idx, cb) {      
                let well;
                let height;

                let topDepth_1 = parseFloat(file.information.TOPDEPTH);
                let topDepth_2 =  parseFloat(((newFiles[idx + 1] || {}).information || {}).TOPDEPTH) || topDepth_1 + parseFloat(self.maxInterval);

                let offset = Number(topDepth_2) - Number(topDepth_1);
                height = Math.min(self.maxInterval, offset);

                if (self.inputPattern.search("WELLNAME") == -1) {
                    well = self.wells.find(w => w.name === self.inputWellName || w.alias === self.inputWellName);
                    console.log(well)
                } else {
                    well = self.wells.find(w => w.name === file.information.WELLNAME || w.alias === file.information.WELLNAME);
                    console.log(well);
                }

                if (well) {
                    wiApi.createOrGetImageSetPromise(well.idWell, self.imgSetName).then(([imageSet, isNew]) => {
                        if (!isNew && !askedAlready(self.imgSetName)) {
                            wiLoading.hide();
                            wiDialog.confirmDialog("Confirmation",`Image set ${self.imgSetName} already exist. New images will be uploaded into this image set. Do you want to continue?`, function(ret) {
                                wiLoading.show($element.find('.modal-dialog')[0]);
                                if (ret) {
                                    createImage(well, file, imageSet, idx, height, cb);
                                } else cb(new Error("Canceled by user"));
                            });
                        }
                        else {
                            createImage(well, file, imageSet, idx, height, cb);
                        }
                    }).catch(err => {
                        // console.error(err);
                        cb(err);
                    });
                } else {
                    cb(new Error("Please select WELLNAME!"));
                }
            }, function (err) {
                if (err) {
                    // console.error(err);
                    $timeout(() => {
                        self.errorMsg = err.message;
                    });
                    callback(false);
                } else {
                    callback(true);
                }
            });
            function createImage(well, file, imageSet, idx, height, cb) {
                well.imageSet = imageSet;
                wiApi.createImagePromise(imageObject(file, well.imageSet.idImageSet, idx, height)).then((image) => {
                    wiApi.uploadImage(file, image.idImage,
                        function (imgUrl) {
                            image.imageUrl = imgUrl;
                            wiApi.updateImagePromise(image).then(image =>
                                cb()
                            ).catch(err =>
                                cb(err)
                            );
                        },
                        function (err) {
                            // console.error(err);
                            cb(err);
                        }, (evt) => {});
                }).catch(function(err) {
                    // console.log(err);
                    cb(new Error("Invalid depth values"));
                    // cb(err);
                });
            }
        }

        function imageObject(uploadFile, idImageSet, orderNum, height) {
            let topDepth = parseFloat(uploadFile.information['TOPDEPTH'] || uploadFile.information['DEPTH']);
            let bottomDepth = parseFloat(uploadFile.information['BOTDEPTH']) || (topDepth + height);
            topDepth = wiApi.convertUnit(topDepth, self.selectedUnit, 'm');
            bottomDepth = wiApi.convertUnit(bottomDepth, self.selectedUnit, 'm');

            return {
                name: uploadFile.name,
                topDepth: topDepth,
                bottomDepth: bottomDepth,
                idImageSet: idImageSet,
                orderNum: orderNum,
                imageUrl: null
            }
        }
        this.getValue = function ([image, brand]) {
            switch (brand) {
                case "WELLNAME":
                    return image.information[brand];
                case "DEPTH":
                case "TOPDEPTH":
                case "BOTDEPTH":
                    // return wiApi.bestNumberFormat(
                    //     wiApi.convertUnit(
                    //         parseFloat(image.information[brand]), 'm', self.getValue([image,'UNIT'])
                    //     ), 3
                    // );
                    return wiApi.bestNumberFormat(parseFloat(image.information[brand]), 3)
                case "UNIT":
                    return image.information[brand] || 'm';
                default:
            }
        }
        this.setValue = function ([image, brand], newValue) {
            switch (brand) {
                case "WELLNAME":
                    image.information[brand] = newValue;
                    break;
                case "DEPTH":
                case "TOPDEPTH":
                case "BOTDEPTH":
                    // image.information[brand] = wiApi.convertUnit(
                    //     parseFloat(newValue), self.getValue([image, 'UNIT']), 'm'
                    // );
                    image.information[brand] = wiApi.bestNumberFormat(parseFloat(newValue), 3);
                    break;
                case "UNIT":
                    let value = newValue.toLowerCase();
                    if (value === "m" || value === 'ft') {
                        image.information[brand] = value;
                    }
                    break;
            }
        }
        this.isValid = function (brand, img) {
            switch (brand) {
                case "WELLNAME":
                    let well = self.wells.find(w =>
                        w.name === img.information[brand] || w.alias === img.information[brand]
                    );
                    return well ? 'green' : 'red';
                case "DEPTH":
                case "TOPDEPTH":
                case "BOTDEPTH":
                    return 'green';
                case "UNIT":
                    let value = self.getValue([img, brand]).toLowerCase();
                    return (value === "m" || value === 'ft') ? 'green' : 'red';
            }
        }
        this.closeModal = function () {
            close(null);
        }
        this.showFileUpload = function (src) {
            this.src = src;
            this.showImage = true;
        }

        function preProcessImage(file, pattern) {
            pattern = pattern.toUpperCase();
            pattern = pattern.replace(/MORE/g, '');
            // pattern = pattern.replace('more','');
            pattern = formatString(pattern);
            // if (!pattern) pattern = 'WELLNAME%DEPTH%UNIT';
            if (!pattern) pattern = '';
            else if (pattern[0] == '%' && pattern[pattern.length - 1] == '%') pattern = pattern.slice(1, pattern.length - 1);
            else if (pattern[0] == '%') pattern = pattern.slice(1, pattern.length);
            else if (pattern[pattern.length - 1] == '%') pattern = pattern.slice(0, pattern.length - 1);

            var reader = new FileReader();

            let indexOfExt = file.name.lastIndexOf('.');
            let stringProcess = file.name.toUpperCase().slice(0, indexOfExt);
            let arrayPatternProcess = pattern.split('%');

            // console.log(arrayPatternProcess);

            // let arrayStringProcess = stringProcess.split('-');
            let arrayString = stringProcess.replace(/[ #@*^$%!~]/g, '-');
            let arrayStringProcess = arrayString.split('-');
            // console.log(arrayStringProcess);
            let arrayPattern = [];
            file.information = {};
            arrayPatternProcess = removeDuplicates(arrayPatternProcess);

            if (arrayStringProcess.length > arrayPatternProcess.length) {
                for (let i in arrayPatternProcess) {
                    file.information[arrayPatternProcess[i]] = arrayStringProcess[i] || '';
                    arrayPattern.push(arrayPatternProcess[i]);
                }
                file.information['MORE'] = [];
                for (let i = arrayPatternProcess.length; i < arrayStringProcess.length; i++) {
                    file.information['MORE'].push(arrayStringProcess[i]);
                }
            } else {
                for (let i in arrayPatternProcess) {
                    file.information[arrayPatternProcess[i]] = arrayStringProcess[i] || '';
                    arrayPattern.push(arrayPatternProcess[i]);
                }
            }

            file.information.arrayPattern = arrayPattern;
            reader.onload = function (data) {
                var src = data.target.result;
                file.src = src;
            }
            reader.readAsDataURL(file);
        }

        function processUpdate(file, pattern) {
            pattern = pattern.toUpperCase();
            pattern = pattern.replace(/MORE/g, '');
            // pattern = pattern.replace('more','');
            pattern = formatString(pattern);
            // if (!pattern) pattern = 'WELLNAME%DEPTH%UNIT';
            if (!pattern) pattern = '';
            else if (pattern[0] == '%' && pattern[pattern.length - 1] == '%') pattern = pattern.slice(1, pattern.length - 1);
            else if (pattern[0] == '%') pattern = pattern.slice(1, pattern.length);
            else if (pattern[pattern.length - 1] == '%') pattern = pattern.slice(0, pattern.length - 1);

            let indexOfExt = file.name.lastIndexOf('.');
            let stringProcess = file.name.toUpperCase().slice(0, indexOfExt);
            // let patternProcess = pattern.toUpperCase();
            let arrayPatternProcess = pattern.split('%');

            // console.log(arrayPatternProcess);
            let arrayString = stringProcess.replace(/[ #@*^$%!~_]/g, '-');
            let arrayStringProcess = arrayString.split('-');
            // console.log(arrayStringProcess);
            // let arrayStringProcess = stringProcess.split('-');
            let arrayPattern = [];
            file.information = {};
            arrayPatternProcess = removeDuplicates(arrayPatternProcess);
            if (arrayStringProcess.length > arrayPatternProcess.length) {
                for (let i in arrayPatternProcess) {
                    file.information[arrayPatternProcess[i]] = arrayStringProcess[i] || '';
                    arrayPattern.push(arrayPatternProcess[i]);
                }
                file.information['MORE'] = [];
                for (let i = arrayPatternProcess.length; i < arrayStringProcess.length; i++) {
                    file.information['MORE'].push(arrayStringProcess[i]);
                }
            } else {
                for (let i in arrayPatternProcess) {
                    file.information[arrayPatternProcess[i]] = arrayStringProcess[i] || '';
                    arrayPattern.push(arrayPatternProcess[i]);
                }
            }
            file.information.arrayPattern = arrayPattern;
        }

        function formatString(pattern) {
            let myPattern = '';
            for (let i = 0; i < pattern.length - 1; i++) {
                if (pattern[i] != '%' || pattern[i - 1] != '%' || i < 1) {
                    myPattern += pattern[i];
                }
            }
            // console.log(myPattern);
            return myPattern;
        }

        function removeDuplicates(a) {
            return Array.from(new Set(a));
        }
    }

    ModalService.showModal({
        template: require("./import-images-modal.html"),
        controller: ModalController,
        controllerAs: 'self'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            ret && callback && callback(ret);
        });
    });
}