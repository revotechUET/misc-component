let helper = require('../DialogHelper');

module.exports = function (ModalService, file, idProject, callback) {
    function ModalController($scope, 
        close, 
        // wiApiService, 
        // wiComponentService,
        wiApi,
        wiDialog,
        $timeout,
        wiLoading
        ) {
        let self = this;
        // let DialogUtils = wiComponentService.getComponent(
        //     wiComponentService.DIALOG_UTILS
        // );
        // let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        // let projectLoaded = wiComponentService.getComponent(
        //     wiComponentService.PROJECT_LOADED
        // );
        $timeout(() => {
            self.file = file;
        })
        let unitGroup11;
        function getUnitGroup11() {
            let unitTable = utils.getUnitArr();
            unitGroup11 = unitTable.filter(unit => unit.idUnitGroup == 11);
        }
        getUnitGroup11();

        this.currentStep = 1;
        this.markerTemplates = [];
        this.actions = [
            {
                title: 'Replace',
                onClick: wiModal => {
                    wiModal.close('replace');
                }
            },
            {
                title: 'Merge',
                onClick: wiModal => {
                    wiModal.close('merge');
                }
            }
        ];
        this.step1Configs = [
            {
                name: 'Header line',
                type: 'number',
                value: 1,
                color: '#00FF8E',
                must: true
            },
            {
                name: 'Unit line',
                type: 'number',
                value: 2,
                edit: true,
                color: '#48CEFF'
            },
            {
                name: 'Data first line',
                type: 'number',
                value: 3,
                color: '#F99600',
                must: true
            }
        ];
        this.step2Configs = [
            {
                name: 'Marker Name',
                type: 'text',
                value: '',
                must: true
            },
            {
                name: 'Well Column',
                type: 'number',
                value: 1,
                col: true,
                color: '#F69FA4'
            },
            {
                name: 'Marker Column',
                type: 'number',
                value: 2,
                col: true,
                color: '#EFF798'
            },
            {
                name: 'Depth Column',
                type: 'number',
                value: 3,
                col: true,
                color: '#9BF768'
            }
        ];

        this.onLoadButtonClicked = function () {
            let configs = self.importController.onLoadConfigs();
            if (!configs) {
                return;
            }
            wiLoading.show(document.getElementsByTagName("body")[0]);
            delete configs.selectFields;
            configs.allContent = recreateAllContent(configs.allContent, {
                decimal: configs.decimal,
                delimiter: configs.delimiter
            });

            // console.log(configs);
            let unitDepth =
                configs['Unit line Data'][configs['Depth Column'] - 1] || '';

            checkUnitOfGroup11(configs, unitDepth, (configs, unitDepth) => {
                let info = {};
                info.markerSetTemplateName = configs['Marker Name'];
                info.listWellsImport = [];
                info.idMarkerSetTemplate;
                info.markerTemplatesInfo = [];
                info.fromUnit = unitDepth;

                self.step1Configs.forEach(config => {
                    configs[config.name] -= 1;
                });
                self.step2Configs.forEach(config => {
                    if (config.col) {
                        configs[config.name] -= 1;
                    }
                });

                // wiApiService.listMarkerSetTemplate(result => {
                //     result.sort((a, b) => {
                //         return a.name.localeCompare(b.name);
                //     });
                //     let listMarkerSetTemplate = result;
                //     let markerSetTemplate;
                //     let existMST = listMarkerSetTemplate.find(mst => {
                //         return (
                //             mst.name.toUpperCase() == info.markerSetTemplateName.toUpperCase()
                //         );
                //     });
                //     if (existMST) {
                //         DialogUtils.confirmDialog(
                //             ModalService,
                //             'Replace MarkerSet confirmation',
                //             `MarkerSet ${
                //             existMST.name
                //             } has been existed, Are you sure you want to replace it?`,
                //             function (res) {
                //                 if (res == 'replace') {
                //                     self.replace = true;
                //                     wiApiService.removeMarkerSetTemplate(existMST.idMarkerSetTemplate, (res, err) => {
                //                         wiApiService.createMarkerSetTemplate(
                //                             { name: info.markerSetTemplateName },
                //                             (mst, err) => {
                //                                 markerSetTemplate = mst;
                //                                 info.idMarkerSetTemplate =
                //                                     markerSetTemplate.idMarkerSetTemplate;
                //                                 // wiComponentService
                //                                 //     .getComponent('wiMarkerTemplateManager')
                //                                 //     .refreshTemplateList();
                //                                 createMarkerTemplates(configs, info, markerSetTemplate);
                //                             }
                //                         );
                //                     })
                //                 } else if(res == 'merge'){
                //                     self.replace = false;
                //                     markerSetTemplate = existMST;
                //                     info.idMarkerSetTemplate =
                //                         markerSetTemplate.idMarkerSetTemplate;
                //                     self.markerTemplates = markerSetTemplate.marker_templates;
                //                     self.markerTemplates.forEach(mt => {
                //                         mt.template = markerSetTemplate.name;
                //                     });
                //                     createMarkerTemplates(configs, info, markerSetTemplate);
                //                 }
                //             },
                //             self.actions
                //         );
                //     } else {
                //         wiApiService.createMarkerSetTemplate(
                //             { name: info.markerSetTemplateName },
                //             (mst, err) => {
                //                 markerSetTemplate = mst;
                //                 info.idMarkerSetTemplate =
                //                     markerSetTemplate.idMarkerSetTemplate;
                //                 // wiComponentService
                //                 //     .getComponent('wiMarkerTemplateManager')
                //                 //     .refreshTemplateList();
                //                 createMarkerTemplates(configs, info, markerSetTemplate);
                //             }
                //         );
                //     }
                // });
                wiApi.listMarkerSetTemplatePromise({idProject})
                .then((result) => {
                    result.sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });
                    let listMarkerSetTemplate = result;
                    let markerSetTemplate;
                    let existMST = listMarkerSetTemplate.find(mst => {
                        return (
                            mst.name.toUpperCase() == info.markerSetTemplateName.toUpperCase()
                        );
                    });
                    wiLoading.hide();
                    if (existMST) {
                        wiDialog.confirmDialog(
                            'Replace MarkerSet confirmation',
                            `MarkerSet ${
                            existMST.name
                            } has been existed, Are you sure you want to replace it?`,
                            function (res) {
                                wiLoading.show(document.getElementsByTagName("body")[0]);
                                if (res == 'replace') {
                                    self.replace = true;
                                    wiApi.removeMarkerSetTemplatePromise({idMarkerSetTemplate: existMST.idMarkerSetTemplate})
                                    .then((res) => {
                                        wiApi.createMarkerSetTemplatePromise({name: info.markerSetTemplateName, idProject: idProject})
                                        .then(mst => {
                                            markerSetTemplate = mst;
                                            info.idMarkerSetTemplate =
                                                markerSetTemplate.idMarkerSetTemplate;
                                            // wiComponentService
                                            //     .getComponent('wiMarkerTemplateManager')
                                            //     .refreshTemplateList();
                                            createMarkerTemplates(configs, info, markerSetTemplate);
                                        });
                                    });
                                } else if(res == 'merge'){
                                    self.replace = false;
                                    markerSetTemplate = existMST;
                                    info.idMarkerSetTemplate =
                                        markerSetTemplate.idMarkerSetTemplate;
                                    self.markerTemplates = markerSetTemplate.marker_templates;
                                    self.markerTemplates.forEach(mt => {
                                        mt.template = markerSetTemplate.name;
                                    });
                                    createMarkerTemplates(configs, info, markerSetTemplate);
                                }
                            },
                            self.actions
                        );
                    } else {
                        wiApi.createMarkerSetTemplatePromise({name: info.markerSetTemplateName, idProject: idProject})
                        .then((mst) => {
                            markerSetTemplate = mst;
                            info.idMarkerSetTemplate =
                                markerSetTemplate.idMarkerSetTemplate;
                            // wiComponentService
                            //     .getComponent('wiMarkerTemplateManager')
                            //     .refreshTemplateList();
                            createMarkerTemplates(configs, info, markerSetTemplate);
                        });
                    }
                })
                close('ok');
            });
        };

        function checkUnitOfGroup11(configs, unitDepth, cb) {
            let checkUnit11 = unitGroup11.find(unit => {
                return unit.name.toUpperCase() == unitDepth.toUpperCase();
            });
            if (checkUnit11) {
                unitDepth = checkUnit11.name;
                cb(configs, unitDepth);
            } else if (!unitDepth || unitDepth == '' || !checkUnit11) {
                DialogUtils.confirmDialog(
                    ModalService,
                    'Setting unit reference confirmation',
                    "The reference unit isn't defined in database, Are you sure you want to import as 'M'",
                    function (yes) {
                        if (yes) {
                            unitDepth = 'M';
                            cb(configs, unitDepth);
                        } else {
                            return;
                        }
                    }
                );
            }
        }

        function createMarkerTemplates(configs, info, markerSetTemplate) {
            for (
                let i = configs['Data first line'];
                i < configs.allContent.length;
                i++
            ) {
                let markerName = configs.allContent[i][configs['Marker Column']];
                let wellName = configs.allContent[i][configs['Well Column']];
                let depth = configs.allContent[i][configs['Depth Column']];
                if (depth) depth = Number(depth);
                if (_.isFinite(parseFloat(depth))) {
                    depth = parseFloat(
                        utils.convertUnit(parseFloat(depth), info.fromUnit, 'M').toFixed(4)
                    );
                }
                // let exist = self.markerTemplates.find(t => {
                //     return t.name == markerName;
                // });
                // if (!exist) {
                //     let newMarkerTemplate = {
                //         name: markerName,
                //         lineStyle: JSON.stringify({
                //             shape: 'line',
                //             dashArray: [0]
                //         }),
                //         idMarkerSetTemplate: info.idMarkerSetTemplate,
                //         lineWidth: 1,
                //         desciption: '',
                //         color: utils.colorGenerator(),
                //         template: markerSetTemplate.name,
                //         new: true
                //     };
                //     self.markerTemplates.push(newMarkerTemplate);
                // }

                exist = info.listWellsImport.find(t => {
                    return t.name.toUpperCase() == wellName.toUpperCase();
                });
                if (!exist) {
                    wellInfo = {
                        name: wellName.trim(),
                        markerArray: [
                            {
                                name: markerName.trim(),
                                depth: depth
                            }
                        ]
                    };
                    info.listWellsImport.push(wellInfo);
                } else {
                    let idx = info.listWellsImport.indexOf(exist);
                    info.listWellsImport[idx].markerArray.push({
                        name: markerName.trim(),
                        depth: depth
                    });
                }
            }

            // wiApiService.listWells({ idProject: projectLoaded.idProject }, listWellsProject => {
            //         listWellsProject.sort((a, b) => {
            //             return a.name.localeCompare(b.name);
            //         });
            //         let i = 0;
            //         while (i < info.listWellsImport.length) {
            //             let exist = listWellsProject.find(wellProject => {
            //                 return (
            //                     wellProject.name.toUpperCase() ==
            //                     info.listWellsImport[i].name.toUpperCase()
            //                 );
            //             });
            //             if (!exist) {
            //                 info.listWellsImport.splice(i, 1);
            //                 continue;
            //             }
            //             info.listWellsImport[i].idWell = exist.idWell;
            //             i++;
            //         }

            //         if (info.listWellsImport.length > 0) {
            //             let max = 0;
            //             let index;
            //             info.listWellsImport.forEach((wi, idx) => {
            //                 let markerArr = uniqueMarkerTemplates(wi.markerArray);
            //                 if (markerArr.length > max) {
            //                     max = markerArr.length;
            //                     index = idx;
            //                 }
            //             });
            //             self.markerTemplates = sortMarkerTemplates(
            //                 info.listWellsImport[index].markerArray,
            //                 info.listWellsImport,
            //                 info
            //             );

            //             async.eachSeries(
            //                 self.markerTemplates,
            //                 (mt, next) => {
            //                     if (!mt.name) {
            //                         __toastr.error("Marker template's name cannot be empty");
            //                         next();
            //                     } else {
            //                         if (mt.new) {
            //                             let payload = angular.copy(mt);
            //                             wiApiService.createMarkerTemplate(payload, (mt, err) => {
            //                                 if (err) {
            //                                     __toastr.error('Can not create marker');
            //                                     next();
            //                                 } else {
            //                                     info.markerTemplatesInfo.push(mt);
            //                                     next();
            //                                 }
            //                             });
            //                         } else {
            //                             info.markerTemplatesInfo.push(mt);
            //                             next();
            //                         }
            //                     }
            //                 },
            //                 err => {
            //                     if (!err) {
            //                         createMarkerSet(
            //                             info.listWellsImport,
            //                             info.markerSetTemplateName,
            //                             info.idMarkerSetTemplate,
            //                             info.markerTemplatesInfo
            //                         );
            //                     }
            //                 }
            //             );
            //         }
            //     }
            // );
            wiApi.getListWells(idProject)
            .then((listWellsProject) => {
                listWellsProject.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
                let i = 0;
                while (i < info.listWellsImport.length) {
                    let exist = listWellsProject.find(wellProject => {
                        return (
                            wellProject.name.toUpperCase() ==
                            info.listWellsImport[i].name.toUpperCase()
                        );
                    });
                    if (!exist) {
                        info.listWellsImport.splice(i, 1);
                        continue;
                    }
                    info.listWellsImport[i].idWell = exist.idWell;
                    i++;
                }

                if (info.listWellsImport.length > 0) {
                    let max = 0;
                    let index;
                    info.listWellsImport.forEach((wi, idx) => {
                        let markerArr = uniqueMarkerTemplates(wi.markerArray);
                        if (markerArr.length > max) {
                            max = markerArr.length;
                            index = idx;
                        }
                    });
                    self.markerTemplates = sortMarkerTemplates(
                        info.listWellsImport[index].markerArray,
                        info.listWellsImport,
                        info
                    );

                    async.eachSeries(
                        self.markerTemplates,
                        (mt, next) => {
                            if (!mt.name) {
                                __toastr.error("Marker template's name cannot be empty");
                                next();
                            } else {
                                if (mt.new) {
                                    let payload = angular.copy(mt);
                                    // wiApiService.createMarkerTemplate(payload, (mt, err) => {
                                    //     if (err) {
                                    //         __toastr.error('Can not create marker');
                                    //         next();
                                    //     } else {
                                    //         info.markerTemplatesInfo.push(mt);
                                    //         next();
                                    //     }
                                    // });
                                    wiApi.createMarkerTemplatePromise(payload)
                                    .then((mt) => {
                                        info.markerTemplatesInfo.push(mt);
                                        next();
                                    })
                                    .catch((err) => {
                                        __toastr.error('Can not create marker');
                                        next();
                                    });
                                } else {
                                    info.markerTemplatesInfo.push(mt);
                                    next();
                                }
                            }
                        },
                        err => {
                            if (!err) {
                                createMarkerSet(
                                    info.listWellsImport,
                                    info.markerSetTemplateName,
                                    info.idMarkerSetTemplate,
                                    info.markerTemplatesInfo
                                );
                            }
                        }
                    );
                }
            })
        }

        function getNewMarkerTemplateOrderNum(markerTemplates) {
            let num = 0;
            for (let zt of markerTemplates) {
                if (!zt.orderNum) break;
                num = parseInt(zt.orderNum);
            }
            return num + 1;
        }

        function sortMarkerTemplates(markerTemplates, listWellsImport, info) {
            let result = [...self.markerTemplates];
            markerTemplates = uniqueMarkerTemplates(markerTemplates);
            let sortKey = 'depth';
            function compareFunc(a, b) {
                return a[sortKey] - b[sortKey];
            }
            markerTemplates.sort(compareFunc);
            listWellsImport.forEach(wi => {
                wi.markerArray.forEach(m => {
                    let exist = markerTemplates.find(
                        mt => mt.name.toUpperCase() == m.name.toUpperCase()
                    );
                    if (!exist) {
                        markerTemplates.push(m);
                    }
                });
            });
            markerTemplates.forEach(mt => {
                let exist = result.find(
                    e => e.name.toUpperCase() == mt.name.toUpperCase()
                );
                if (!exist) {
                    let orderNum = getNewMarkerTemplateOrderNum(result);
                    let element = {
                        name: mt.name,
                        lineStyle: JSON.stringify({
                            shape: 'line',
                            dashArray: [0]
                        }),
                        idMarkerSetTemplate: info.idMarkerSetTemplate,
                        lineWidth: 2,
                        desciption: '',
                        color: utils.colorGenerator(),
                        orderNum: orderNum,
                        template: info.markerSetTemplateName,
                        new: true
                    };
                    result.push(element);
                }
                // else {
                // let idx = self.markerTemplates.indexOf(exist);
                // result.push(self.markerTemplates[idx]);
                // }
            });
            return result;
        }

        function uniqueMarkerTemplates(markerTemplates) {
            function unique(value, index, self) {
                let exist = self.find(
                    (e, idx) =>
                        e.name.toUpperCase() == value.name.toUpperCase() && index < idx
                );
                if (exist) {
                    return false;
                }
                return true;
            }
            markerTemplates = markerTemplates.filter(unique);

            return markerTemplates;
        }

        function createMarkerSet(
            listWellsImport,
            markerSetTemplateName,
            idMarkerSetTemplate,
            markerTemplatesInfo
        ) {
            listWellsImport.forEach(wellImport => {
                let idWell = wellImport.idWell;
                let depthsOfWell = utils.getDepthsOfWell(idWell);
                wellImport.markerArray = cleanMarker(
                    wellImport.markerArray,
                    depthsOfWell
                );
                let payload = {
                    name: markerSetTemplateName,
                    idWell: idWell,
                    idMarkerSetTemplate: idMarkerSetTemplate
                };
                // wiApiService.listMarkerSet(idWell, result => {
                //     let listMarkerSet = result;
                //     let markerSet;
                //     let existMS = listMarkerSet.find(ms => {
                //         return ms.name.toUpperCase() == markerSetTemplateName.toUpperCase();
                //     });
                //     if (existMS) {
                //         if (self.replace) {
                //             wiApiService.removeMarkerSet(existMS.idMarkerSet, result => {
                //                 wiApiService.createMarkerSet(payload, (ms, err) => {
                //                     markerSet = ms;
                //                     createListMarker(
                //                         wellImport.markerArray,
                //                         markerTemplatesInfo,
                //                         markerSet
                //                     );
                //                 });
                //             });
                //         } else {
                //             wellImport.markerArray = cleanMarker(
                //                 wellImport.markerArray,
                //                 depthsOfWell,
                //                 existMS.markers
                //             );
                //             markerSet = existMS;
                //             createListMarker(
                //                 wellImport.markerArray,
                //                 markerTemplatesInfo,
                //                 markerSet
                //             );
                //         }
                //     } else {
                //         wiApiService.createMarkerSet(payload, (ms, err) => {
                //             markerSet = ms;
                //             createListMarker(
                //                 wellImport.markerArray,
                //                 markerTemplatesInfo,
                //                 markerSet
                //             );
                //         });
                //     }
                // });
                wiApi.listMarkerSetPromise({idWell})
                .then((result) => {
                    let listMarkerSet = result;
                    let markerSet;
                    let existMS = listMarkerSet.find(ms => {
                        return ms.name.toUpperCase() == markerSetTemplateName.toUpperCase();
                    });
                    if (existMS) {
                        if (self.replace) {
                            wiApi.removeMarkerSetPromise({idMarkerSet: existMS.idMarkerSet})
                            .then((result) => {
                                wiApi.createMarkerSetPromise(payload)
                                .then((ms) => {
                                    markerSet = ms;
                                    createListMarker(
                                        wellImport.markerArray,
                                        markerTemplatesInfo,
                                        markerSet
                                    );
                                });
                            });
                        } else {
                            wellImport.markerArray = cleanMarker(
                                wellImport.markerArray,
                                depthsOfWell,
                                existMS.markers
                            );
                            markerSet = existMS;
                            createListMarker(
                                wellImport.markerArray,
                                markerTemplatesInfo,
                                markerSet
                            );
                        }
                    } else {
                        // wiApiService.createMarkerSet(payload, (ms, err) => {
                        //     markerSet = ms;
                        //     createListMarker(
                        //         wellImport.markerArray,
                        //         markerTemplatesInfo,
                        //         markerSet
                        //     );
                        // });
                        wiApi.createMarkerSetPromise(payload)
                        .then((ms) => {
                            markerSet = ms;
                            createListMarker(
                                wellImport.markerArray,
                                markerTemplatesInfo,
                                markerSet
                            );
                        })
                    }
                });
            });
        }

        function createListMarker(wellImportInfo, markerTemplatesInfo, markerSet) {
            if (wellImportInfo) {
                async.eachSeries(
                    wellImportInfo,
                    (wii, next) => {
                        let markerTemplate = markerTemplatesInfo.find(mti => {
                            return mti.name.toUpperCase() == wii.name.toUpperCase();
                        });
                        // if (!markerTemplate) {
                        //     console.log(wii);
                        // }
                        createMarker(wii, markerSet, markerTemplate, next);
                    },
                    err => {
                        if (!err) {
                            // handlers = wiComponentService.getComponent(
                            //     wiComponentService.WI_EXPLORER_HANDLERS
                            // );
                            // handlers.ReloadProjectButtonClicked();
                            __toastr.success('Successfully Imported Marker Set');
                        }
                    }
                );
            }
        }

        function createMarker(wellImportInfo, markerSet, markerTemplate, next) {
            let payload = {
                depth: wellImportInfo.depth,
                flag: true,
                idMarkerSet: markerSet.idMarkerSet,
                idMarkerTemplate: markerTemplate.idMarkerTemplate,
                new: true,
                markerTemplate: markerTemplate
            };

            // wiApiService.createMarker(payload, (m, err) => {
            //     next();
            // });
            wiApi.createMarkerPromise(payload)
            .then((m) => {
                next();
            })
            .finally(() => {
                wiLoading.hide();
            })
        }

        function cleanMarker(markerArr, depthsOfWell, markersExist) {
            let count = 0;
            while (count < markerArr.length) {
                if (
                    !_.isFinite(markerArr[count].depth) ||
                    // !markerArr[count].depth ||
                    // isNaN(markerArr[count].depth) ||
                    markerArr[count].depth != markerArr[count].depth ||
                    markerArr[count].depth < depthsOfWell.topDepth ||
                    markerArr[count].depth > depthsOfWell.bottomDepth
                ) {
                    markerArr.splice(count, 1);
                    continue;
                }
                if (markersExist) {
                    let checkExistMarker = markersExist.find(me => {
                        return me.depth == markerArr[count].depth;
                    });
                    if (checkExistMarker) {
                        markerArr.splice(count, 1);
                        continue;
                    }
                }
                count++;
            }
            if (markerArr.length <= 1) {
                return markerArr;
            }
            for (let i = 1; i < markerArr.length; i++) {
                if (markerArr[i].depth == markerArr[i - 1].depth) {
                    markerArr.splice(i, 1);
                    i--;
                }
            }
            return markerArr;
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
            self.importController.currentConfig2 = 1;
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
            self[stepConfigs].forEach(config => {
                if (
                    ((config.must) && !config.value) ||
                    (self.importController && !self.importController.file) ||
                    (config.col && (!config.value || config.value > self.importController.getNumOfColumn()))
                ) {
                    check = false;
                }
            });
            return check;
        };

        function recreateAllContent(content, fileConfigs) {
            let detectRegex = self.importController.detectRegex;
            let allContent = [];
            if (fileConfigs.decimal) {
                detectRegex = new RegExp(
                    detectRegex.replace('\\' + fileConfigs.decimal, '')
                );
            }

            content.forEach(e => {
                let line = e.split(detectRegex);
                allContent.push(line);
            });
            return allContent;
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
                    let line = viewContent[lineIdx].split(
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
                let line = viewContent[i].split(detectRegex);
                tableContent.push(line);
            }
            return tableContent;
        }

        this.getController = function (controller) {
            self.importController = controller;
        };
    }

    ModalService.showModal({
        template: require('./import-marker-set.html'),
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(modal => {
        helper.initModal(modal);
        modal.close.then(data => {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        });
    });
};
