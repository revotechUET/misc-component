let helper = require('../DialogHelper');

module.exports = function (ModalService, config, callback) {
    function ModalController($scope, close, $timeout, $http) {
        var self = this;
        this.httpGet = function(url) {
            return new Promise((resolve, reject) => {
                $http({
                    method: "GET",
                    url: url,
                    headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': 'http://127.0.0.1:5000',
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
        self.exploreUrl = config.exploreUrl || "https://users.i2g.cloud/file-explorer/shallow?dir=";
        self.storage_database = config.storage_database || '{"company":"I2G","directory":"e391f55350c81d17a0df3a1f5a243b5550542230","whereami":"WI_STORAGE_ADMIN"}';
        self.rootFolder = config.rootFolder || "/";
        self.currentFolder = self.rootFolder;
        self.currentPath = [];
        self.httpGet(self.exploreUrl + encodeURIComponent(self.rootFolder))
        .then((res) => {
            console.log(res.data);
            self.listFolders = res.data.folders;
        });
        self.dbClickFolder = function(item) {
            console.log(item);
            self.currentFolder = item.path;
            self.currentPath.push({rootName: item.rootName, displayName: item.displayName});
            self.httpGet(self.exploreUrl + encodeURIComponent(self.rootFolder + self.currentPath.map(c => c.rootName).join('/')))
            .then((res) => {
                console.log(res);
                self.listFolders = res.data.folders;
            });
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
                self.listFolders = res.data.folders;
            });
        }
        this.onOkButtonClicked = function () {
            close(self.currentFolder);
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
