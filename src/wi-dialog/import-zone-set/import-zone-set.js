let helper = require('../DialogHelper');

module.exports = function (ModalService, file, idProject, callback) {
    function ModalController(
        $scope,
        close,
        // wiApiService,
        // wiComponentService,
        $timeout,
        wiApi,
        wiDialog,
        wiLoading
    ) {
        let self = this;
        $timeout(() => {
            self.file = file;
        })
        // let DialogUtils = wiComponentService.getComponent(
        //     wiComponentService.DIALOG_UTILS
        // );

        // let utils = wiComponentService.getComponent(wiComponentService.UTILS);
        // let projectLoaded = wiComponentService.getComponent(
        //     wiComponentService.PROJECT_LOADED
        // );

        let unitGroup11;
        function getUnitGroup11() {
            let unitTable = wiApi.getUnitTable();
            unitGroup11 = unitTable.filter(unit => unit.idUnitGroup == 11);
        }
        getUnitGroup11();

        this.currentStep = 1;
        this.zoneTemplates = [];
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
                name: 'Zone Set Name',
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
                name: 'Zone Column',
                type: 'number',
                value: 2,
                col: true,
                color: '#EFF798'
            },
            {
                name: 'Top Column',
                type: 'number',
                value: 3,
                refer: true,
                color: '#9BF768'
            },
            {
                name: 'Bottom Column',
                type: 'number',
                value: 4,
                refer: true,
                color: '#B0CDE2'
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

            let unitDepth = configs['Unit line Data'][configs['Top Column']] || '';

            checkUnitOfGroup11(configs, unitDepth, (configs, unitDepth) => {
                let info = {};
                info.zoneSetTemplateName = configs['Zone Set Name'];
                info.listWellsImport = [];
                info.idZoneSetTemplate;
                info.zoneTemplatesInfo = [];
                info.fromUnit = unitDepth;

                self.step1Configs.forEach(config => {
                    configs[config.name] -= 1;
                });
                self.step2Configs.forEach(config => {
                    if (config.col || config.refer) {
                        configs[config.name] -= 1;
                    }
                });

                // wiApiService.listZoneSetTemplate(result => {
                //     result.sort((a, b) => {
                //         return a.name.localeCompare(b.name);
                //     });
                //     let listZoneSetTemplate = result;
                //     let zoneSetTemplate;
                //     let existZST = listZoneSetTemplate.find(zst => {
                //         return (
                //             zst.name.toUpperCase() == info.zoneSetTemplateName.toUpperCase()
                //         );
                //     });
                //     if (existZST) {
                //         wiDialog.confirmDialog(
                //             'Replace ZoneSet confirmation',
                //             `Zoneset ${
                //             existZST.name
                //             } has been existed, Are you sure you want to replace it?`,
                //             function (res) {
                //                 if ( res == 'replace') {
                //                     self.replace = true;
                //                     wiApiService.deleteZoneSetTemplate({idZoneSetTemplate: existZST.idZoneSetTemplate}, (res, err) => {
                //                         wiApiService.createZoneSetTemplate({ name: info.zoneSetTemplateName }, (zst, err) => {
                //                             zoneSetTemplate = zst;
                //                             info.idZoneSetTemplate = zst.idZoneSetTemplate;
                //                             // wiComponentService
                //                             //     .getComponent('wiZoneTemplateManager')
                //                             //     .refreshTemplateList();
                //                             createZoneTemplates(configs, info, zoneSetTemplate);
                //                         });
                //                     })
                //                 } else if ( res == 'merge'){
                //                     self.replace = false;
                //                     zoneSetTemplate = existZST;
                //                     info.idZoneSetTemplate = zoneSetTemplate.idZoneSetTemplate;
                //                     self.zoneTemplates = zoneSetTemplate.zone_templates;
                //                     createZoneTemplates(configs, info, zoneSetTemplate);
                //                 }
                //             },
                //             self.actions
                //         );
                //     } else {
                //         wiApiService.createZoneSetTemplate(
                //             { name: info.zoneSetTemplateName },
                //             (zst, err) => {
                //                 zoneSetTemplate = zst;
                //                 info.idZoneSetTemplate = zst.idZoneSetTemplate;
                //                 // wiComponentService
                //                 //     .getComponent('wiZoneTemplateManager')
                //                 //     .refreshTemplateList();
                //                 createZoneTemplates(configs, info, zoneSetTemplate);
                //             }
                //         );
                //     }
                // });

                wiApi.listZoneSetTemplatePromise({idProject: idProject})
                .then(result => {
                        result.sort((a, b) => {
                            return a.name.localeCompare(b.name);
                        });
                        let listZoneSetTemplate = result;
                        let zoneSetTemplate;
                        let existZST = listZoneSetTemplate.find(zst => {
                            return (
                                zst.name.toUpperCase() == info.zoneSetTemplateName.toUpperCase()
                            );
                        });
                        wiLoading.hide();
                        if (existZST) {
                            wiDialog.confirmDialog(
                                'Replace ZoneSet confirmation',
                                `Zoneset ${
                                existZST.name
                                } has been existed, Are you sure you want to replace it?`,
                                function (res) {
                                    wiLoading.show(document.getElementsByTagName("body")[0]);
                                    if ( res == 'replace') {
                                        self.replace = true;
                                        // wiApiService.deleteZoneSetTemplate({idZoneSetTemplate: existZST.idZoneSetTemplate}, (res, err) => {
                                        //     wiApiService.createZoneSetTemplate({ name: info.zoneSetTemplateName }, (zst, err) => {
                                        //         zoneSetTemplate = zst;
                                        //         info.idZoneSetTemplate = zst.idZoneSetTemplate;
                                        //         // wiComponentService
                                        //         //     .getComponent('wiZoneTemplateManager')
                                        //         //     .refreshTemplateList();
                                        //         createZoneTemplates(configs, info, zoneSetTemplate);
                                        //     });
                                        // })
                                        wiApi.deleteZoneSetTemplatePromise({idZoneSetTemplate: existZST.idZoneSetTemplate})
                                        .then(res => {
                                            wiApi.createZoneSetTemplatePromise({name: info.zoneSetTemplateName, idProject: idProject})
                                            .then(zst => {
                                                zoneSetTemplate = zst;
                                                info.idZoneSetTemplate = zst.idZoneSetTemplate;
                                                // wiComponentService
                                                //     .getComponent('wiZoneTemplateManager')
                                                //     .refreshTemplateList();
                                                createZoneTemplates(configs, info, zoneSetTemplate);
                                            })
                                        });
                                    } else if ( res == 'merge'){
                                        self.replace = false;
                                        zoneSetTemplate = existZST;
                                        info.idZoneSetTemplate = zoneSetTemplate.idZoneSetTemplate;
                                        self.zoneTemplates = zoneSetTemplate.zone_templates;
                                        createZoneTemplates(configs, info, zoneSetTemplate);
                                    }
                                },
                                self.actions
                            );
                        } else {
                            // wiApiService.createZoneSetTemplate({ name: info.zoneSetTemplateName },
                            //     (zst, err) => {
                            //         zoneSetTemplate = zst;
                            //         info.idZoneSetTemplate = zst.idZoneSetTemplate;
                            //         // wiComponentService
                            //         //     .getComponent('wiZoneTemplateManager')
                            //         //     .refreshTemplateList();
                            //         createZoneTemplates(configs, info, zoneSetTemplate);
                            //     });
                            wiApi.createZoneSetTemplatePromise({name: info.zoneSetTemplateName, idProject: idProject})
                            .then((zst) => {
                                zoneSetTemplate = zst;
                                info.idZoneSetTemplate = zst.idZoneSetTemplate;
                                // wiComponentService
                                //     .getComponent('wiZoneTemplateManager')
                                //     .refreshTemplateList();
                                createZoneTemplates(configs, info, zoneSetTemplate);
                            })
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
                wiDialog.confirmDialog(
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

        function createZoneTemplates(configs, info, zoneSetTemplate) {
            for (let i = configs['Data first line']; i < configs.allContent.length; i++) {
                let zoneName = configs.allContent[i][configs['Zone Column']];
                let wellName = configs.allContent[i][configs['Well Column']];
                let startDepth = configs.allContent[i][configs['Top Column']];
                if (startDepth) startDepth = Number(startDepth);
                let endDepth = configs.allContent[i][configs['Bottom Column']];
                if (endDepth) endDepth = Number(endDepth);
                if (_.isFinite(parseFloat(startDepth)) && _.isFinite(parseFloat(endDepth))) {
                    startDepth = parseFloat(
                        utils
                            .convertUnit(parseFloat(startDepth), info.fromUnit, 'M')
                            .toFixed(4)
                    );
                    endDepth = parseFloat(
                        utils
                            .convertUnit(parseFloat(endDepth), info.fromUnit, 'M')
                            .toFixed(4)
                    );
                }

                let exist = info.listWellsImport.find(t => {
                    return t.name.toUpperCase() == wellName.toUpperCase();
                });
                if (!exist) {
                    wellInfo = {
                        name: wellName.trim(),
                        zoneArray: [
                            {
                                name: zoneName.trim(),
                                startDepth: startDepth,
                                endDepth: endDepth,
                                new: true
                            }
                        ]
                    };
                    info.listWellsImport.push(wellInfo);
                } else {
                    let idx = info.listWellsImport.indexOf(exist);
                    info.listWellsImport[idx].zoneArray.push({
                        name: zoneName.trim(),
                        startDepth: startDepth,
                        endDepth: endDepth,
                        new: true
                    });
                }
            }
            wiApi.getWellsPromise(idProject)
            .then( listWellsProject => {
                listWellsProject.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
                let i = 0;
                while (i < info.listWellsImport.length) {
                    let exist = listWellsProject.find(
                        wellProject =>
                            info.listWellsImport[i].name.toUpperCase() ==
                            wellProject.name.toUpperCase()
                    );
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
                        let zoneArr = uniqueZoneTemplates(wi.zoneArray);
                        if (zoneArr.length > max) {
                            max = zoneArr.length;
                            index = idx;
                        }
                    });
                    self.zoneTemplates = sortZoneTemplates(
                        info.listWellsImport[index].zoneArray,
                        info.listWellsImport,
                        info.idZoneSetTemplate
                    );

                    async.eachSeries(self.zoneTemplates, (zone, next) => {
                        if (!zone.name) {
                            __toastr.error("Zone template's name cannot be empty");
                            next();
                        } else {
                            if (zone.new) {
                                let payload = angular.copy(zone);
                                // wiApiService.createZoneTemplate(payload, function (z, err) {
                                //     info.zoneTemplatesInfo.push(z);
                                //     next();
                                // });
                                wiApi.createZoneTemplatePromise(payload)
                                .then(z => {
                                    info.zoneTemplatesInfo.push(z);
                                    next();
                                })
                            } else {
                                info.zoneTemplatesInfo.push(zone);
                                next();
                            }
                        }
                    },
                        err => {
                            if (!err) {
                                createZoneSet(
                                    info.listWellsImport,
                                    info.zoneSetTemplateName,
                                    info.idZoneSetTemplate,
                                    info.zoneTemplatesInfo
                                );
                            }
                        }
                    );
                }
            });

            // wiApiService.listWells(
            //         { idProject: projectLoaded.idProject },
            //         listWellsProject => {
            //             listWellsProject.sort((a, b) => {
            //                 return a.name.localeCompare(b.name);
            //             });
            //             let i = 0;
            //             while (i < info.listWellsImport.length) {
            //                 let exist = listWellsProject.find(
            //                     wellProject =>
            //                         info.listWellsImport[i].name.toUpperCase() ==
            //                         wellProject.name.toUpperCase()
            //                 );
            //                 if (!exist) {
            //                     info.listWellsImport.splice(i, 1);
            //                     continue;
            //                 }
            //                 info.listWellsImport[i].idWell = exist.idWell;
            //                 i++;
            //             }

            //             if (info.listWellsImport.length > 0) {
            //                 let max = 0;
            //                 let index;
            //                 info.listWellsImport.forEach((wi, idx) => {
            //                     let zoneArr = uniqueZoneTemplates(wi.zoneArray);
            //                     if (zoneArr.length > max) {
            //                         max = zoneArr.length;
            //                         index = idx;
            //                     }
            //                 });
            //                 self.zoneTemplates = sortZoneTemplates(
            //                     info.listWellsImport[index].zoneArray,
            //                     info.listWellsImport,
            //                     info.idZoneSetTemplate
            //                 );

            //                 async.eachSeries(self.zoneTemplates, (zone, next) => {
            //                     if (!zone.name) {
            //                         __toastr.error("Zone template's name cannot be empty");
            //                         next();
            //                     } else {
            //                         if (zone.new) {
            //                             let payload = angular.copy(zone);
            //                             wiApiService.createZoneTemplate(payload, function (z, err) {
            //                                 info.zoneTemplatesInfo.push(z);
            //                                 next();
            //                             });
            //                         } else {
            //                             info.zoneTemplatesInfo.push(zone);
            //                             next();
            //                         }
            //                     }
            //                 },
            //                     err => {
            //                         if (!err) {
            //                             createZoneSet(
            //                                 info.listWellsImport,
            //                                 info.zoneSetTemplateName,
            //                                 info.idZoneSetTemplate,
            //                                 info.zoneTemplatesInfo
            //                             );
            //                         }
            //                     }
            //                 );
            //             }
            //         }
            //     );
        }

        function sortZoneTemplates(zoneTemplates, listWellsImport, idZoneSetTemplate) {
            let result = [...self.zoneTemplates];
            zoneTemplates = uniqueZoneTemplates(zoneTemplates);
            let sortKey = 'startDepth';
            function compareFunc(a, b) {
                return a[sortKey] - b[sortKey];
            }
            zoneTemplates.sort(compareFunc);
            listWellsImport.forEach(wi => {
                wi.zoneArray.forEach(z => {
                    let exist = zoneTemplates.find(zt => {
                        return zt.name.toUpperCase() == z.name.toUpperCase();
                    });
                    if (!exist) {
                        zoneTemplates.push(z);
                    }
                });
            });
            zoneTemplates.forEach(zt => {
                let ext1 = result.find(
                    e => e.name.toUpperCase() == zt.name.toUpperCase()
                );
                if (!ext1) {
                    let orderNum = getNewZoneTemplateOrderNum(result);
                    let element = {
                        name: zt.name,
                        background: utils.colorGenerator(),
                        foreground: 'black',
                        pattern: 'none',
                        idZoneSetTemplate: idZoneSetTemplate,
                        desciption: '',
                        orderNum: orderNum,
                        new: true,
                        flag: true,
                        exportValue: orderNum
                    };
                    result.push(element);
                }
                // else {
                // let idx = self.zoneTemplates.indexOf(exist);
                // result.push(self.zoneTemplates[idx]);
                // }
            });
            return result;
        }
        function getNewZoneTemplateOrderNum(zoneTemplates) {
            let num = 0;
            for (let zt of zoneTemplates) {
                if (!zt.orderNum) break;
                num = parseInt(zt.orderNum);
            }
            return num + 1;
        }

        function uniqueZoneTemplates(zoneTemplates) {
            let result = zoneTemplates;
            function unique(value, index, self) {
                let name1 = value.name;
                let exist = self.find((e, idx) => {
                    let name2 = e.name;
                    return name1.toUpperCase() === name2.toUpperCase() && index < idx;
                });
                if (exist) {
                    return false;
                }
                return true;
            }
            result = result.filter(unique);

            return result;
        }

        function createZoneSet(
            listWellsImport,
            zoneSetTemplateName,
            idZoneSetTemplate,
            zoneTemplatesInfo
        ) {
            listWellsImport.forEach(wellImport => {
                let idWell = wellImport.idWell;
                let depthsOfWell = utils.getDepthsOfWell(idWell);
                let payload = {
                    name: zoneSetTemplateName,
                    idWell: idWell,
                    idZoneSetTemplate: idZoneSetTemplate
                };
                wiApi.getZonesetsPromise(idWell)
                .then(result => {
                    let listZoneSet = result;
                    let zoneSet;
                    let existZS = listZoneSet.find(zs => {
                        return zs.name.toUpperCase() == zoneSetTemplateName.toUpperCase();
                    });
                    if (existZS) {
                        if (self.replace) {
                            wiApi.removeZoneSetPromise({idZoneSet: existZS.idZoneSet})
                            .then(result => {
                                wellImport.zoneArray = cleanZone(
                                    wellImport.zoneArray,
                                    depthsOfWell
                                );
                                wiApi.createZoneSetPromise(payload)
                                .then(rs => {
                                    zoneSet = zs;
                                    createListZone(
                                        wellImport.zoneArray,
                                        zoneSet,
                                        zoneTemplatesInfo
                                    );
                                });
                            });
                        } else {
                            wiApi.getZoneSetPromise({idZoneSet: existZS.idZoneSet})
                            .then(result => {
                                zoneSet = result;
                                wellImport.zoneArray = cleanZone(
                                    wellImport.zoneArray,
                                    depthsOfWell,
                                    zoneSet.zones
                                );
                                createListZone(
                                    wellImport.zoneArray,
                                    zoneSet,
                                    zoneTemplatesInfo
                                );
                            });
                        }
                    } else {
                        wellImport.zoneArray = cleanZone(
                            wellImport.zoneArray,
                            depthsOfWell
                        );
                        wiApi.createZoneSetPromise(payload)
                        .then(zs => {
                            zoneSet = zs;
                            createListZone(wellImport.zoneArray, zoneSet, zoneTemplatesInfo);
                        });
                    }
                })
            });
        }
        function createListZone(zoneArr, zoneSet, zoneTemplatesInfo) {
            async.eachSeries(
                zoneArr,
                (z, next) => {
                    let zoneTemplate = zoneTemplatesInfo.find(zti => {
                        return zti.name.toUpperCase() == z.name.toUpperCase();
                    });
                    createZone(z, zoneSet, zoneTemplate, next);
                },
                err => {
                    if (!err) {
                        // handlers = wiComponentService.getComponent(
                        //     wiComponentService.WI_EXPLORER_HANDLERS
                        // );
                        // handlers.ReloadProjectButtonClicked();
                        __toastr.success('Successfully Imported Zone Set');
                    }
                }
            );
        }
        function createZone(wellImportInfo, zoneSet, zoneTemplate, next) {
            let zone_template = {
                background: zoneTemplate.background,
                foreground: zoneTemplate.foreground,
                pattern: zoneTemplate.pattern,
                idZoneTemplate: zoneTemplate.idZoneTemplate
            };

            let payload = {
                name: wellImportInfo.name,
                startDepth: wellImportInfo.startDepth,
                endDepth: wellImportInfo.endDepth,
                idZoneSet: zoneSet.idZoneSet,
                idZoneTemplate: zoneTemplate.idZoneTemplate,
                zone_template: zone_template
            };
            // wiApiService.createZone(payload, zone => {
            //     next();
            // });
            wiApi.createZonePromise(payload)
            .then(zone => {
                next();
            })
            .finally(() => {
                wiLoading.hide();
            })
        }
        function cleanZone(zoneArr, depthsOfWell, zonesExist) {
            let count = 0;
            let sortKey = 'startDepth';
            function compareFunc(a, b) {
                return a[sortKey] - b[sortKey];
            }
            zoneArr.sort(compareFunc);

            while (count < zoneArr.length) {
                // console.log(!_.isFinite(parseFloat(zoneArr[count].startDepth)), !_.isFinite(parseFloat(zoneArr[count].endDepth)), zoneArr[count].startDepth >= zoneArr[count].endDepth, zoneArr[count].startDepth > depthsOfWell.bottomDepth, zoneArr[count].endDepth < depthsOfWell.topDepth)
                if (
                    !_.isFinite(parseFloat(zoneArr[count].startDepth)) ||
                    !_.isFinite(parseFloat(zoneArr[count].endDepth)) ||
                    zoneArr[count].startDepth >= zoneArr[count].endDepth ||
                    zoneArr[count].startDepth > depthsOfWell.bottomDepth ||
                    zoneArr[count].endDepth < depthsOfWell.topDepth
                ) {
                    zoneArr.splice(count, 1);
                    continue;
                }
                if (zoneArr[count].startDepth < depthsOfWell.topDepth) {
                    zoneArr[count].startDepth = depthsOfWell.topDepth;
                } else if (zoneArr[count].endDepth > depthsOfWell.bottomDepth) {
                    zoneArr[count].endDepth = depthsOfWell.bottomDepth;
                }
                count++;
            }

            for (let i = 0; i < zoneArr.length; i++) {
                let curZone = zoneArr[i];
                if (curZone.new) {
                    let beforeZone = zoneArr[i - 1];
                    let afterZone = zoneArr[i + 1];
                    let theSameZone = zoneArr.find(
                        (z, idx) =>
                            !z.new &&
                            idx != i &&
                            curZone.startDepth == z.startDepth &&
                            curZone.endDepth == z.endDepth
                    );
                    if (theSameZone || curZone.startDepth >= curZone.endDepth) {
                        let idx = zoneArr.indexOf(theSameZone);
                        zoneArr.splice(i, 1);
                        i--;
                        continue;
                    }
                    if (i == 0 || curZone.startDepth >= beforeZone.endDepth) {
                        if (
                            beforeZone &&
                            curZone.startDepth == beforeZone.endDepth &&
                            curZone.name.toUpperCase() == beforeZone.name.toUpperCase()
                        ) {
                            zoneArr[i - 1].endDepth = curZone.endDepth;
                            zoneArr.splice(i, 1);
                            i--;
                        }
                        continue;
                    } else if (
                        beforeZone &&
                        curZone.startDepth < beforeZone.endDepth &&
                        curZone.endDepth > beforeZone.endDepth
                    ) {
                        if (curZone.name.toUpperCase() == beforeZone.name.toUpperCase()) {
                            zoneArr[i - 1].endDepth = curZone.endDepth;
                            zoneArr.splice(i, 1);
                            i--;
                            continue;
                        }
                        zoneArr[i].startDepth = beforeZone.endDepth;
                    } else if (
                        afterZone &&
                        !afterZone.new &&
                        curZone.startDepth < afterZone.startDepth &&
                        curZone.endDepth <= afterZone.startDepth
                    ) {
                        continue;
                    } else if (
                        afterZone &&
                        !afterZone.new &&
                        curZone.startDepth < afterZone.startDepth &&
                        curZone.endDepth > afterZone.startDepth
                    ) {
                        if (curZone.name.toUpperCase() == afterZone.name.toUpperCase()) {
                            zoneArr[i + 1].startDepth = curZone.startDepth;
                            zoneArr.splice(i, 1);
                            i--;
                            continue;
                        }
                        zoneArr[i].endDepth = afterZone.startDepth;
                    } else {
                        zoneArr.splice(i, 1);
                        i--;
                    }
                }
            }

            count = 0;
            while (count < zoneArr.length) {
                if (zonesExist) {
                    let checkZone = zonesExist.find(ze => {
                        return (
                            (zoneArr[count].startDepth <= ze.startDepth &&
                                zoneArr[count].endDepth >= ze.endDepth) ||
                            (zoneArr[count].startDepth >= ze.startDepth &&
                                zoneArr[count].endDepth <= ze.endDepth)
                        );
                    });
                    if (checkZone) {
                        zoneArr.splice(count, 1);
                        continue;
                    }
                    checkZone = zonesExist.find(ze => {
                        return (
                            zoneArr[count].startDepth >= ze.startDepth &&
                            zoneArr[count].startDepth < ze.endDepth &&
                            zoneArr[count].endDepth >= ze.endDepth
                        );
                    });
                    if (checkZone) {
                        let idx = zonesExist.indexOf(checkZone);
                        zoneArr[count].startDepth = zonesExist[idx].endDepth;
                    }
                    checkZone = zonesExist.find(ze => {
                        return (
                            zoneArr[count].startDepth <= ze.startDepth &&
                            zoneArr[count].endDepth > ze.startDepth &&
                            zoneArr[count].endDepth <= ze.endDepth
                        );
                    });
                    if (checkZone) {
                        let idx = zonesExist.indexOf(checkZone);
                        zoneArr[count].endDepth = zonesExist[idx].startDepth;
                    }
                    if (zoneArr[count].startDepth >= zoneArr[count].endDepth) {
                        zoneArr.splice(count, 1);
                        continue;
                    }
                }

                count++;
            }

            zoneArr = zoneArr.filter(z => z.new);
            return zoneArr;
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
                    ((config.col || config.refer) && (!config.value || config.value > self.importController.getNumOfColumn()))
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
        template: require('./import-zone-set.html'),
        controller: ModalController,
        controllerAs: 'wiModal'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (data) {
            helper.removeBackdrop();
            if (data) {
                callback(data);
            }
        });
    });
};
