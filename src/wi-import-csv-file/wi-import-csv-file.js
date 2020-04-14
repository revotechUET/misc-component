const name = 'wiImportCsvFileNew';

require('./wi-import-csv-file.less');
Controller.$inject = ['$scope', '$element'];
function Controller(
    $scope,
    $element,
    // wiComponentService,
    // wiApiService,
    // ModalService
) {
    const self = this;

    // let DialogUtils = wiComponentService.getComponent(
    //     wiComponentService.DIALOG_UTILS
    // );

    this.fileConfigs = {
        delimiter: '',
        decimal: '.'
    };

    this.$onInit = function () {
        self.currentConfig1 = 0;
        self.currentConfig2 = 0;
        self.hadEditStep1Configs = false;
        $scope.$watch(
            () => `${JSON.stringify(self.fileConfigs)}`,
            (newVal, oldVal) => {
                if (newVal != oldVal) {
                    self.tableContent = self.goToStep2(
                        self.step1Configs,
                        self.fileConfigs,
                        self.viewContent,
                        self.linesShow || 0
                    );
                }
            }
        );
        $scope.$watch(
            () => self.file,
            (newVal, oldVal) => {
                if (newVal && self.file) {
                    onInputDropChange();
                }
            }
        );

        $scope.$watch(
            () => self.currentStep,
            (newVal, oldVal) => {
                if (newVal != oldVal && newVal == 2) {
                    if (!self.hadEditStep1Configs) {
                        self.hadEditStep1Configs = true;
                        self.setupConfig('1', self.step1Configs[0].value);
                    }
                    self.tableContent = self.goToStep2(
                        self.step1Configs,
                        self.fileConfigs,
                        self.viewContent,
                        self.linesShow || 0
                    );
                }
            }
        );
        $scope.$watch(() => self.bindbackController, (newVal, oldVal) => {
            if(newVal) {
                 if (self.bindbackController) {
                    self.bindbackController(self);
                }
            }
        })
        self.detectRegex = new RegExp(self.detectRegex);

        // if (self.bindbackController) {
        //     self.bindbackController(self);
        // }
    };
    
    this.clickDropdown = function(config) {
    //     config.filterStr = '';
    //     listValue.forEach(value => {
    //         if (value.value.toUpperCase().indexOf(filterStr.toUpperCase()) < 0) {
    //             value.hidden = true;
    //         } else {
    //             value.hidden = false;
    //         }
    //     })
    }

    this.onFilterChange = function(filterStr, listValue) {
        listValue.forEach(value => {
            if (value.value.toUpperCase().indexOf(filterStr.toUpperCase()) < 0) {
                value.hidden = true;
            } else {
                value.hidden = false;
            }
        })
    }

    this.onUnitOfColChange = function (rowIdx, colIdx) {
        let configs = self.step1Configs;
        let unitLine = configs.find(c => c.name == 'Unit line');
        let idxOfULInConfigs;
        if (unitLine) idxOfULInConfigs = configs.indexOf(unitLine);

        if (idxOfULInConfigs && rowIdx == idxOfULInConfigs) {
            self.step2Configs.forEach((c, idx) => {
                if (c.refer) {
                    self.step1Configs[idxOfULInConfigs].data[c.value - 1] =
                        unitLine.data[colIdx];
                }
            });
        }
    };

    this.changeCheckAll = function () {
        if (self.checkAll) {
            for (let i = 0; i < self.selectFields.length; i++) {
                self.selectFields[i] = 1;
            }
        } else {
            for (let i = 0; i < self.selectFields.length; i++) {
                self.selectFields[i] = 0;
            }
        }
    };

    this.setupConfig = function (step, value, idx) {
        let currentConfig = `currentConfig${step}`;
        if (idx >= 0) {
            self[currentConfig] = idx;
        }
        stepConfigs = `step${step}Configs`;
        self.hadEditStep1Configs = true;
        checkDuplicateLine(value, stepConfigs, currentConfig);
        // self[stepConfigs].forEach(c => {
        //     if (c.must && c.value <= 0) check = false;
        // });
        if (self[currentConfig] >= 0) {
            switch (step) {
                case '1':
                    self[stepConfigs][self[currentConfig]].value = value;
                    let headerLineCf = self.step1Configs.find(
                        c => c.name == 'Header line'
                    );
                    if (headerLineCf && headerLineCf.value > 0) {
                        let length = self.allContent[
                            headerLineCf.value - 1
                        ].split(new RegExp(self.detectRegex)).length;
                        self.constructCheckAll(length);
                    }
                case '2':
                    if (
                        self[stepConfigs][self[currentConfig]].col ||
                        self[stepConfigs][self[currentConfig]].refer
                    ) {
                        self.step2Configs[self[currentConfig]].value = value;
                    }
            }
        }
        // if (
        //     self[stepConfigs].find(c => c.name == 'Reference Column') &&
        //     step == 2
        // ) {
        //     self[currentConfig] = self[stepConfigs].indexOf(
        //         self[stepConfigs].find(c => c.name == 'Reference Column')
        //     );
        // }
    };

    // this.clickInputConfig = function(idxConfig) {
    //     let currentConfig = `currentConfig${self.currentStep}`;
    //     let stepConfigs = `step${self.currentStep}Configs`;
    //     if (
    //         self[stepConfigs].find(c => c.name == 'Reference Column') &&
    //         self.currentStep == 2
    //     ) {
    //         self[currentConfig] = self[stepConfigs].indexOf(
    //             self[stepConfigs].find(c => c.name == 'Reference Column')
    //         );
    //     } else {
    //         self[currentConfig] = idxConfig;
    //     }
    // };

    this.setColor = function (step, value) {
        let stepConfigs = `step${step}Configs`;
        // if (!self[stepConfigs]) return 'initial';
        let result = self[stepConfigs].find(config => {
            return config.color && config.value == value;
        });
        if (result) {
            return result.color;
        }
    };

    this.checkEditCell = function ($index) {
        if (
            $index < self.step1Configs.length &&
            self.step1Configs[$index].edit
        ) {
            return $index;
        }
        return -1;
    };

    this.updateLinesShow = function () {
        if (self.linesShow < 1) {
            self.linesShow = 1;
        }
        if (self.linesShow < self.viewContent.length) {
            self.viewContent.splice(
                self.linesShow,
                self.viewContent.length - self.linesShow
            );
        } else if (self.linesShow > self.viewContent.length) {
            for (
                let i = self.viewContent.length;
                i < self.linesShow && i < self.allContent.length;
                i++
            ) {
                self.viewContent.push(self.allContent[i]);
            }
        }
    };

    this.onLoadConfigs = function () {
        // if (!checkReferenceCol()) {
        //     return undefined;
        // }
        let configs = {};
        configs.file = self.file;
        configs.allContent = self.allContent;
        Object.assign(
            configs,
            self.fileConfigs,
            configsToObj(1),
            configsToObj(2)
        );
        if (self.selectFields) {
            configs.selectFields = self.selectFields;
        }
        step1Configs = {};
        step2Configs = {};
        return configs;

        function configsToObj(step) {
            let stepConfigs = `step${step}Configs`;
            if (self[stepConfigs]) {
                let configs = self[stepConfigs].reduce((obj, item) => {
                    obj[item.name] = item.value;
                    if (item.data) {
                        obj[`${item.name} Data`] = JSON.parse(
                            angular.toJson(item.data)
                        );
                    }
                    return obj;
                }, {});
                return configs;
            }
            return {};
        }
    };

    this.getConfigItemList = function(name) {
        let idx;
        idx = self.step2Configs.indexOf(
            self.step2Configs.find(c => c.name == name)
        );
        if (idx >= 0) {
            return self.step2Configs[idx].listValue;
        }
        return [];
    }
    this.setupListedConfig = function (name, value) {
        let idx = -1;
        idx = self.step2Configs.indexOf(
            self.step2Configs.find(c => c.name == name)
        );
        if (idx >= 0) {
            self.step2Configs[idx].value = value;
        }
    };

    function checkDuplicateLine(value, stepConfigs, currentConfig) {
        let curConfig = self[stepConfigs][self[currentConfig]];
        if (
            stepConfigs == 'step2Configs' &&
            (!curConfig.col && !curConfig.refer)
        )
            return;
        self[stepConfigs].forEach((c, idx) => {
            if (
                c.value == value &&
                idx != self[currentConfig] &&
                (stepConfigs == 'step1Configs' ||
                    (stepConfigs == 'step2Configs' && (c.col || c.refer)))
            ) {
                c.value = 0;
                // let line = c;
                // if (line && line.value > 0) {
                //     let idx = self[stepConfigs].indexOf(line);
                //     self[stepConfigs][idx].value = 0;
                //     line = undefined;
                // }
            }
        });
    }

    function onInputDropChange() {
        // let file = self.file[0];
        let file = self.file;

        if (file) {
            let fileName = file.name;
            let allViews = [];
            let views = [];

            var readFile = new FileReader();
            readFile.readAsText(file);
            readFile.onload = function (e) {
                var contents = e.target.result;
                var allTextLines = contents.split(/\r\n|\n/);

                for (var i = 0; i < allTextLines.length; i++) {
                    if (i == allTextLines.length - 1 && !allTextLines[i]) {
                        continue;
                    }
                    allTextLines[i] = allTextLines[i].trim();
                    allViews.push(allTextLines[i]);

                    if (self.linesShow && i < self.linesShow) {
                        views.push(allTextLines[i]);
                        if (
                            i == self.linesShow - 1 ||
                            i == allTextLines.length - 2
                        ) {
                            $scope.$apply(() => {
                                self.viewContent = views;
                            });
                        }
                    } else if (!self.linesShow) {
                        views.push(allTextLines[i]);
                    }
                }
            };
            readFile.onloadend = function () {
                if (!self.linesShow) {
                    $scope.$apply(() => {
                        self.viewContent = views;
                    });
                }
                self.allContent = allViews;
                $element.find('.label')[0].innerText = fileName;
                if (self.step2Configs) {
                    let name = fileName.substring(0, fileName.lastIndexOf('.'));
                    // let importName = self.step2Configs.find(config => {
                    //     return config.name.indexOf('Name') >= 0;
                    // });
                    self.step2Configs.forEach(step => {
                        if (step.name.indexOf('Name') > 0) {
                            step.value = name;
                        }
                    });
                }
            };
        }
    }

    this.getNumOfColumn = function () {
        let number = 0;
        let headerLineCf = self.step1Configs.find(
            c => c.name == 'Header line'
        );
        number = self.tableContent[headerLineCf.value - 1].length;
        return number;
    }

    this.constructCheckAll = function (length) {
        self.selectFields = new Array(length);
        if (self.select == 'all') {
            self.checkAll = 1;
            for (let i = 0; i < self.selectFields.length; i++) {
                self.selectFields[i] = 1;
            }
        } else {
            self.checkAll = 0;
            for (let i = 0; i < self.selectFields.length; i++) {
                self.selectFields[i] = 0;
            }
        }
    };
}

const app = angular.module(name, []);

app.component(name, {
    template: require('./wi-import-csv-file.html'),
    controller: Controller,
    controllerAs: 'self',
    transclude: true,
    bindings: {
        step1Configs: '<',
        step2Configs: '<',
        currentStep: '<',
        bindbackController: '<',
        goToStep2: '<',
        linesShow: '<',
        select: '@',
        detectRegex: '@',
        file: '<'
    }
});

exports.name = name;
