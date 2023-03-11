import { wiApiServiceBase } from '@revotechuet/misc-component-vue';
const serviceName = 'wiApi';
let clientHash = {};

angular.module(serviceName, ['wiToken', 'ngFileUpload'])
    .factory(serviceName, ['$http', 'wiToken', 'Upload', function ($http, wiToken, Upload) {
        let service = new wiApiService($http, wiToken, Upload);
        service.doInit();
        return service;
    }]
    );

function wiApiService($http, wiToken, Upload, idClient) {
    wiApiServiceBase.call(this, $http, wiToken, idClient)
    const self = this;
    this.idClient = idClient || 'WI_ANGULAR';
    clientHash[this.idClient] = this;

    this.client = function (_idClient) {
        if (!clientHash[_idClient]) {
            clientHash[_idClient] = new wiApiService($http, wiToken, Upload, _idClient);
            clientHash[_idClient].setBaseUrl(this.getBaseUrl());
        }
        return clientHash[_idClient];
    }

    const setBaseUrl = this.setBaseUrl;
    this.setBaseUrl = function (baseUrl) {
        setBaseUrl(baseUrl);
        this.doInit();
    }

    this.uploadImage = uploadImage;
    function uploadImage(image, idImage, successCb, errorCb, progressCb) {
        return Upload.upload({
            url: self.getBaseUrl() + '/image-upload',
            headers: {
                Authorization: wiToken.getToken(),
                Service: "WI_BACKEND"
            },
            data: {
                idImage: idImage,
                file: image
            }
        }).then(
            resp => successCb(resp.data.content),
            resp => errorCb(resp),
            evt => progressCb(parseFloat(100.0 * evt.loaded / evt.total))
        ).catch(err => errorCb(err));
    }
    this.createCurvePromise = createCurvePromise;
    function createCurvePromise(request) {
        const isArrayCurve = request.columnIndex != undefined;
        if (!Array.isArray(request.data[0])) {
            request.data = request.data.map((d, i) => [i, d])
        }
        let requestData = isArrayCurve ? request.data.map(d => d[1]) : request.data.map(d => d.join(' ')).join('\n');
        const fileData = new Blob([requestData]);
        if (!request.type) request.type = "NUMBER";
        let curveName = null;
        curveName = (request.name || request.curveName || '').toUpperCase();
        let route = isArrayCurve ? '/project/well/dataset/curve/processing-array-data-curve' : '/project/well/dataset/curve/new-raw-curve';
        let configUpload = {
            url: self.getBaseUrl() + route,
            headers: {
                'Referrer-Policy': 'no-referrer',
                Authorization: wiToken.getToken(),
                'Service': 'WI_BACKEND',
                'WHOAMI': self.idClient
                // CurrentProject: window.localStorage.getItem('LProject') ? JSON.parse(window.localStorage.getItem('LProject')).name : 'Unknown'
            },
            data: {
                ...request,
                curveName,
                data: fileData
            }
        }
        return new Promise((resolve, reject) => {
            Upload.upload(configUpload)
                .then((response) => {
                    if (response && response.data.code === 200) {
                        resolve(response.data.content);
                    } else {
                        reject(new Error(response.data.content))
                    }
                }, (err) => {
                    if (err) reject(err);
                })
        })
    }
    this.postWithFile = postWithFile;
    function postWithFile(route, dataPayload, options = {}) {
        // var self = this;
        let serviceHeader = null;
        switch (options.service) {
            case 'auth':
                serviceHeader = "WI_AUTH";
                break;
            case 'processing':
                serviceHeader = "WI_PROCESSING";
                break;
            default:
                serviceHeader = "WI_INVENTORY";
                break;
        }
        return new Promise(function (resolve, reject) {
            let configUpload = {
                url: self.getBaseUrl() + route,
                headers: {
                    'Referrer-Policy': 'no-referrer',
                    'Authorization': window.localStorage.getItem('token'),
                    'Service': serviceHeader
                },
                arrayKey: '',
                data: dataPayload
            };
            const upload = Upload.upload(configUpload);
            upload.then(
                function (responseSuccess) {
                    if (responseSuccess.data && responseSuccess.data.code === 200 && responseSuccess.data.content) {
                        return resolve(responseSuccess.data.content);
                    } else if (responseSuccess.data && responseSuccess.data.code === 401) {
                        window.localStorage.removeItem('token');
                        window.localStorage.removeItem('username');
                        window.localStorage.removeItem('password');
                        window.localStorage.removeItem('rememberAuth');
                        location.reload();
                    } else if (responseSuccess.data && responseSuccess.data.reason) {
                        return reject(responseSuccess.data.reason);
                    } else {
                        return reject('Response is invalid!');
                    }
                },
                function (responseError) {
                    if (responseError.data && responseError.data.content) {
                        return reject(responseError.data.reason);
                    } else {
                        return reject(null);
                    }
                },
                function (evt) {
                    // let progress = Math.round(100.0 * evt.loaded / evt.total);
                    // progressCb && progressCb(progress, upload);
                    // console.log('evt upload', progress);
                }
            );
        });
    }
    this.uploadFilesToInventory = uploadFilesToInventory;
    function uploadFilesToInventory(payload, callback, url, options) {
        // let self = this;
        self.postWithFile(url, payload, options)
            .then(function (response) {
                if (callback) callback(response);
            })
            .catch(function (err) {
                console.log(err);
                callback(err);
            })
    }
}
wiApiService.prototype = Object.create(wiApiServiceBase.prototype);