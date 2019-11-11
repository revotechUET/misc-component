let helper = require('../DialogHelper');

module.exports = function (ModalService, file, callback) {
    function ModalController(
        $scope,
        close,
        // wiApiService,
        // wiComponentService,
        // wiOnlineInvService,
        $timeout,
        wiApi,
        wiDialog
    ) {
        let self = this;
        // let DialogUtils = wiComponentService.getComponent(
        //     wiComponentService.DIALOG_UTILS
        // );
        let unitGroup11;
        function getUnitGroup11() {
            let unitTable = utils.getUnitArr();
            unitGroup11 = unitTable.filter(unit => unit.idUnitGroup == 11);
        }
        getUnitGroup11();
        this.$onInit = async function() {
            self.listOfWells = [];
            self.currentStep = 1;
            wiApi.listWellsPromise({start: 0, limit: 50, forward: true})
                .then(listOfWells => {
                    listOfWells.forEach(w => {
                        self.listOfWells.push(w.name);
                    });
                    self.step1Configs = [
                        {
                            name: 'Header line',
                            type: 'number',
                            value: 1,
                            color: '#00FF8E',
                            edit: true,
                            must: true
                        },
                        {
                            name: 'Unit line',
                            type: 'number',
                            value: 2,
                            color: '#48CEFF',
                            edit: true
                        },
                        {
                            name: 'Data first line',
                            type: 'number',
                            value: 3,
                            color: '#F99600',
                            must: true
                        }
                    ];
                    self.step2Configs = [
                        {
                            name: 'Well Name',
                            type: 'list',
                            value: '',
                            must: true,
                            listValue: self.listOfWells.map(wellName => ({
                                value: wellName
                            })),
                            filterable: true
                        },
                        { name: 'Dataset Name', type: 'text', value: '', must: true },
                        {
                            name: 'Reference Column',
                            type: 'text',
                            value: 1,
                            col: true,
                            color: '#B4E5F7'
                            // disabled: true
                        },
                        {
                            name: 'NULL',
                            type: 'list',
                            value: -9999,
                            listValue: [-999, -9999, -999.25].map(nullVal => ({
                                value: nullVal
                            }))
                        }
                    ];
                    $timeout(() => {
                        self.file = file;
                    })
                }
            );
        }


        // function getWiiItems() {
        //     return wiComponentService.getComponent('wiiItems');
        // }

        // function refreshInventory() {
        //     wiComponentService.emit('refresh-inventory-inspection');
        //     getWiiItems().emptyItems();
        //     getWiiItems()
        //         .getWiiProperties()
        //         .emptyList();
        // }

        this.onLoadButtonClicked = function () {
            let configs = self.importController.onLoadConfigs();

            if (!configs) {
                return;
            }
            toUpperCaseAllName(configs);
            checkReference(configs, configs => {
                if (!configs) {
                    return;
                }
                let selectFields = [];
                configs.selectFields.forEach((field, idx) => {
                    if (field == 1 && idx != configs['Reference Column'] - 1) {
                        selectFields.push(idx);
                    }
                });
                configs.selectFields = selectFields;
                configs.override = true;
                delete configs[`${self.step1Configs[2].name} Data`];
                delete configs.allContent;

                let headers = [];
                let units = [];
                configs.unitReference =
                    configs['Unit line Data'][configs['Reference Column'] - 1] || '';
                configs.selectFields.forEach(idx => {
                    headers.push(configs['Header line Data'][idx].replace('/', '_'));
                    units.push(configs['Unit line Data'][idx]);
                });
                configs['Header line Data'] = headers;
                configs['Unit line Data'] = units;

                self.step1Configs.forEach(config => {
                    configs[config.name] -= 1;
                });
                self.step2Configs.forEach(config => {
                    if (config.col) {
                        configs[config.name] -= 1;
                    }
                });
                sendFileToInv(configs);
            });
        };

        function toUpperCaseAllName(configs) {
            configs['Dataset Name'] = configs['Dataset Name'].toUpperCase();
            configs['Well Name'] = configs['Well Name'].toUpperCase();
            configs['Header line Data'] = configs['Header line Data'].map(name =>
                name.toUpperCase()
            );
        }

        function checkReference(configs, cb) {
            const N_LOOPS = 1000;
            let idxData = configs['Data first line'] - 1;
            let idxRef = configs['Reference Column'] - 1;
            let nLoops = Math.min(configs.allContent.length - 2, N_LOOPS);
            let isContinous = true;
            let decimal = configs.decimal;
            let delimiter = configs.delimiter != '' ? configs.delimiter : /[ \t\,\;]/;
            let step = 0;

            for (let i = 0; i < nLoops; i++) {
                let cell = configs.allContent[idxData + i].split(delimiter)[idxRef].replace(decimal, '.');
                if (cell === '' || isNaN(cell)) {
                    __toastr.error('Reference cannot contain alphanumerical values');
                    return;
                }
                let current = parseFloat(cell);
                let before = parseFloat(
                    configs.allContent[idxData + i - 1]
                        .split(delimiter)
                    [idxRef].replace(decimal, '.')
                );
                if (i >= 2 && ((current - before).toFixed(4) != step || step <= 0)) {
                    isContinous = false;
                    break;
                } else if (i == 1) {
                    step = (current - before).toFixed(4);
                }
            }
            if (!isContinous) {
                wiDialog.confirmDialog(
                    'Setting unit reference confirmation',
                    "The depth reference isn't continuous, import as discrete data?",
                    function (yes) {
                        if (yes) {
                            configs.coreData = true;
                            cb(configs);
                        } else {
                            cb(null);
                        }
                    }
                );
            } else {
                cb(configs);
            }
        }

        function checkUnitOfGroup11(configs, unitReference, cb) {
            let checkUnit11 = unitGroup11.find(unit => {
                return unit.name.toUpperCase() == unitReference.toUpperCase();
            });
            if (checkUnit11) {
                unitReference = checkUnit11.name;
                cb(configs, unitReference);
            } else if (!unitReference || unitReference == '' || !checkUnit11) {
                wiDialog.confirmDialog(
                    'Setting unit reference confirmation',
                    "The reference unit isn't defined in database, Are you sure you want to import as 'M'",
                    function (yes) {
                        if (yes) {
                            unitReference = 'M';
                            cb(configs, unitReference);
                        } else {
                            return;
                        }
                    }
                );
            }
        }

        function sendFileToInv(configs) {
            wiApi.uploadFilesToInventory(configs, function (response) {
                console.log('===>Upload files done', response);
                if (response === 'UPLOAD FILES FAILED') {
                    __toastr.error('Some errors while upload file');
                } else {
                    __toastr.success('Successfully uploaded');
                    // $timeout(function () {
                    //     refreshInventory();
                    // }, 500);
                }
            }, '/upload/csv');
            close(null);
        }
        this.onCancelButtonClicked = function () {
            close(null);
        };
        this.onNextButtonClicked = function (
            step1Configs,
            fileConfigs,
            viewContent,
            linesShow
        ) {
            self.importController.currentConfig2 = 2;
            return createTableContent(
                step1Configs,
                fileConfigs,
                viewContent,
                linesShow
            );
        };
        this.checkStepConfigs = function (step) {
            let stepConfigs = `step${step}Configs`;
            let check = true;
            if (!self[stepConfigs]) return false;
            self[stepConfigs].forEach(config => {
                if (
                    ((config.must || config.col) && !config.value) ||
                    (self.importController && !self.importController.file)
                ) {
                    check = false;
                }
            });
            return check;
        };

        function customSplit(str, delimiter) {
            let words;
            if (str.includes('"')) {
                str = str.replace(/"[^"]+"/g, function (match, idx, string) {
                    let tmp = match.replace(/"/g, '');
                    return '"' + Buffer.from(tmp).toString('base64') + '"';
                });
                words = str.split(delimiter);
                words = words.map(function (word) {
                    if (word.includes('"')) {
                        return (
                            '"' +
                            Buffer.from(word.replace(/"/g, ''), 'base64').toString() +
                            '"'
                        );
                    } else return word;
                });
            } else {
                words = str.split(delimiter);
            }
            return words;
        }

        function createTableContent(configs, fileConfigs, viewContent, linesShow) {
            let tableContent = [];
            let maxLine = 0;
            let length = 0;
            let detectRegex = self.importController.detectRegex;
            if (fileConfigs.decimal) {
                detectRegex = new RegExp(
                    detectRegex.replace('\\' + fileConfigs.decimal, '')
                );
            }

            configs.forEach(config => {
                let lineIdx = config.value - 1;
                if (lineIdx > maxLine) {
                    maxLine = lineIdx;
                }
                if (lineIdx >= 0) {
                    let line = customSplit(
                        viewContent[lineIdx],
                        fileConfigs.delimiter != '' ? fileConfigs.delimiter : detectRegex
                    );
                    length = line.length;
                    config.data = line;
                    tableContent.push(line);
                } else {
                    let arr = new Array(length);
                    arr.map(e => {
                        return '';
                    });
                    config.data = arr;
                    tableContent.push(arr);
                }
            });
            for (let i = maxLine + 1; i < viewContent.length; i++) {
                if (linesShow > 0 && tableContent.length == linesShow) {
                    break;
                }
                // let line = viewContent[i].split(detectRegex);
                let line = customSplit(
                    viewContent[i],
                    fileConfigs.delimiter != '' ? fileConfigs.delimiter : detectRegex
                );
                tableContent.push(line);
            }
            return tableContent;
        }

        this.getController = function (controller) {
            self.importController = controller;
        };
    }

    ModalService.showModal({
        template: require('./csv-import-modal.html'),
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            // if (data) {
            //     callback(data);
            // }
            helper.removeBackdrop();
        });
    });
};