let helper = require('../DialogHelper');

module.exports = function (ModalService, config, Upload, callback) {
    function ModalController($scope, close, $timeout, $http, wiDialog, wiLoading) {
        var self = this;
        this.httpGet = function(url) {
            return new Promise((resolve, reject) => {
                $http({
                    method: "GET",
                    url: url,
                    headers: {
                            'Content-Type': 'application/json',
                            // 'Access-Control-Allow-Origin': 'http://127.0.0.1:5000',
                            'Access-Control-Allow-Credentials': 'true',
                            'Referrer-Policy': 'no-referrer',
                            'Authorization': window.localStorage.getItem('token'),
                            'Storage-Database': self.storage_database,
                            'Service': 'WI_PROJECT_STORAGE'
                    }
                })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err);
                })
            })
        }
        this.httpPost = function(url, payload) {
            return new Promise((resolve, reject) => {
                $http({
                    method: "POST",
                    url: url,
                    headers: {
                        'Authorization': window.localStorage.getItem('token'),
                        'Storage-Database': self.storage_database,
                        'Content-Type': 'application/json',
                        'Referrer-Policy': 'no-referrer',
                        'Service': 'WI_PROJECT_STORAGE',
                    },
                    data: payload,
                    responseType: 'arraybuffer'
                })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err);
                })
            })
        }
        self.title = config.title || "Select";
        self.url = config.url || "https://users.i2g.cloud";
        self.exploreUrl = config.url + "/file-explorer/shallow?dir=";
        self.checkFileExistedUrl = self.url +  '/upload/is-existed?metaData=';
        self.download = self.url + '/download';
        self.storage_database = config.storage_database;
        self.rootFolder = config.rootFolder || "/";
        self.currentFolder = self.rootFolder;
        self.currentPath = [];
        self.file = config.file;
        self.currentFile = null;
        wiLoading.show(document.getElementsByTagName('body')[0]);
        self.httpGet(self.exploreUrl + encodeURIComponent(self.rootFolder))
        .then((res) => {
            console.log(res.data);
            $timeout(() => {
                // self.listFolders = res.data.folders;
                self.fileList = [...res.data.files, ...res.data.folders];
            })
        })
        .finally(() => {
            wiLoading.hide();
        });
        self.dbClickFolder = function(item) {
            console.log(item);
            wiLoading.show(document.getElementsByTagName('body')[0]);
            self.currentFolder = item.path;
            self.currentPath.push({rootName: item.rootName, displayName: item.displayName});
            self.httpGet(self.exploreUrl + encodeURIComponent(self.rootFolder + self.currentPath.map(c => c.rootName).join('/')))
            .then((res) => {
                console.log(res);
                $timeout(() => {
                    // self.listFolders = res.data.folders;
                    self.fileList = [...res.data.files, ...res.data.folders];
                })
            })
            .finally(() => {
                wiLoading.hide();
            });
        }
        self.clickFolder = function(item) {
            console.log(item);
            self.currentFolder = item.path;
        }
        self.clickFile = function(item) {
            console.log(item);
            self.currentFile = item;
        }
        self.dbClickFile = function(item) {
            console.log(item);
            self.currentFile = item;
            self.selectedFile();
        }
        self.goToFolder = function(key) {
            self.currentPath = self.currentPath.slice(0, key + 1);
            if(key == -1) {
                self.currentFolder = self.rootFolder;
            }else {
                self.currentFolder = self.rootFolder + self.currentPath.map(c => c.rootName).join('/')
            }
            self.httpGet(self.exploreUrl + encodeURIComponent(self.rootFolder + self.currentPath.map(c => c.rootName).join('/')))
            .then((res) => {
                console.log(res);
                $timeout(() => {
                    // self.listFolders = res.data.folders;
                    self.fileList = [...res.data.files, ...res.data.folders];
                });
            });
        }
        this.onOkButtonClicked = function () {
            if(config.selectWhat == "folder") {
                self.selectedFolder();
            }if(config.selectWhat == "file") {
                self.selectedFile();
            }else{
                close(null);
            }
        }
        this.selectedFolder = function() {
            let currentTime = Date.now() + '';
            self.file.uploadingProgress = null;
            self.file.overwrite = false;
            self.file.existed = false;
            self.file.metaData = {
                name: self.file.name,
                type: (self.file.type || self.file.type !== '') ? self.file.type : 'Unknown',
                size: self.file.size,
                location: (self.currentFolder + self.file.name).replace('//', '/'),
                // location: (fileExplorerCtrl.rootFolder + fileExplorerCtrl.currentPath.map(c => c.rootName).join('/') + file.name).replace('//', '/'),
                author: window.localStorage.getItem('username'),
                uploaded: currentTime,
                modified: currentTime,
                // modified: file.lastModified,
                source: 'Desktop Uploaded',
                field: '',
                well: '{}',
                welltype: '',
                // parameter: '',
                datatype: '',
                quality: '5',
                relatesto: '{}',
                description: ''
            };
            let metaDataRequest = {};
            for (let key in self.file.metaData) {
            metaDataRequest[key] = self.file.metaData[key] + '';
            }
            self.httpGet(self.checkFileExistedUrl + encodeURIComponent(JSON.stringify(metaDataRequest)))
            .then( result => {
                if ((result.code && result.code === 409) && !self.file.overwrite) {
                    self.file.existed = true;
                    self.file.overwrite = true;
                    wiDialog.confirmDialog(
                        `Configuration already exists!`,
                        `Are you sure you want to replace it?`,
                        function(yes) {
                            if(yes) {
                                self.uploadFile(metaDataRequest);
                            }else {
                                close(null);
                            }
                        })
                }else {
                    self.uploadFile(metaDataRequest);
                }
                    
                // }
                });
            close(self.currentFolder);
        }
        this.uploadFile = function(metaDataRequest) {
            self.uploadUrl = self.url + '/upload?location=' + encodeURIComponent((self.currentFolder).replace('//', '/')) + '&metaData=' + encodeURIComponent(JSON.stringify(metaDataRequest)) + '&overwrite=' + self.file.overwrite;
            let uploadingObject = Upload.upload({
                url: self.uploadUrl,
                headers: {
                'Content-Type': 'application/json',
                'Referrer-Policy': 'no-referrer',
                'Authorization': window.localStorage.getItem('token'),
                'Storage-Database': self.storage_database,
                'Service': "WI_PROJECT_STORAGE"
                },
                data: {
                'upload-file': self.file
                }
            });
            uploadingObject.then(resp => {
                console.log("Upload success");
            })
            .catch(err => {
                console.log("Upload terminated", err.message);
            });
        }
        this.selectedFile = function() {
            console.log(self.currentFile);
            self.httpPost(self.download, {
                files : [self.currentFile.path]
            })
            .then((res) => {
                let blob = new Blob([res], {
                    type: 'application/octet-stream'
                  });
                console.log(res, blob);
                close(res);
            })
        }
        this.onCancelButtonClicked = function () {
            close(null);
        }
    }

    ModalService.showModal({
        template: require("./tree-explorer.html"),
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
