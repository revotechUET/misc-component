import { wiid as genWiid} from '@revotechuet/misc-component-vue';
const serviceName = 'wiApi';
var clientHash = {};

angular.module(serviceName, ['wiToken', 'ngFileUpload'])
    .factory(serviceName, ['$http', 'wiToken', 'Upload', '$timeout', function ($http, wiToken, Upload, $timeout) {
        let service = new wiApiService($http, wiToken, Upload, $timeout);
        // service.doInit();
        return service;
    }]
    );


function wiApiService($http, wiToken, Upload, $timeout, idClient) {
    let self = this;
    this.idClient = idClient || 'WI_ANGULAR';
    clientHash[this.idClient] = this;
    this.$http = $http;
    // this.baseUrl = window.localStorage.getItem('__BASE_URL') || 'http://dev.i2g.cloud';
    let __cache_BaseUrl = null
    let __cache_file_manager_url = window.localStorage.getItem('FILE_MANAGER');
    this.getBaseUrl = () => {
        if(!__cache_BaseUrl) {
            __cache_BaseUrl = window.localStorage.getItem('BASE_URL');
        }
        return __cache_BaseUrl || 'http://users.i2g.cloud';
    };
    let unitTable = undefined;
    let familyTable;
    let paletteTable;
    this.getFamilyTable = () => familyTable
    this.getUnitTable = () => unitTable;

    this.client = function(_idClient) {
        if (!clientHash[_idClient]) {
            clientHash[_idClient] = new wiApiService($http, wiToken, Upload, $timeout, _idClient);
            clientHash[_idClient].setBaseUrl(this.getBaseUrl());
        }
        return clientHash[_idClient];
    }
    function get(url, opts = {}) {
        const baseUrl = opts.baseUrl || self.getBaseUrl();
        return new Promise((resolve, reject) => {
            $http({
                ...opts.config,
                url: baseUrl + url,
                method: 'GET',
                headers: {
                    'Service': opts.service ? opts.service : 'WI_BACKEND',
                    'WHOAMI': self.idClient
                }
            }).then(function (res) { resolve(res.data) }, function (err) {
                reject(err);
            });
        });
    }
    function postPromise(url, data, opts = {}) {
        return new Promise(function(resolve, reject) {
            const baseUrl = opts.baseUrl || self.getBaseUrl();
            const headers = opts.noToken ? {} : {
                Authorization: wiToken.getToken(),
                'Service': opts.service ? opts.service : 'WI_BACKEND',
                'WHOAMI': self.idClient
            };
            const payloadHash = genWiid(data, wiToken.getToken());
            $http({
                method: 'POST',
                url: baseUrl + url + `?wiid=${payloadHash}`,
                data: data,
                headers: headers
            }).then((response) => {
                if (response.data.code === 200) resolve(response.data.content);
                else reject(new Error(response.data.reason));
            }, (err) => {
                reject(err);
            })
        });
    }
    function deletePromise(url, data, opts = {}) {
        return new Promise(function(resolve, reject) {
            const baseUrl = opts.baseUrl || self.getBaseUrl();
            const headers = opts.noToken ? {} : {
                Authorization: wiToken.getToken(),
                'Service': opts.service ? opts.service : 'WI_BACKEND',
                CurrentProject: window.localStorage.getItem('LProject') ? JSON.parse(window.localStorage.getItem('LProject')).name : 'Unknown',
                'Content-Type': 'application/json',
            };
            const payloadHash = genWiid(data, wiToken.getToken());
            $http({
                method: 'DELETE',
                url: baseUrl + url + `?wiid=${payloadHash}`,
                data: data,
                headers: headers
            }).then((response) => {
                if (response.data.code === 200) resolve(response.data.content);
                else reject(new Error(response.data.reason));
            }, (err) => {
                reject(err);
            })
        });
    }

    this.addShareSession = function (client, owner, project) {
        return postPromise('/project/add-share-session', {
            client, owner, project
        })
    }
    this.removeShareSession = function () {
        return postPromise('/project/remove-share-session');
    }

    this.updatePalettes = updatePalettes;
    function updatePalettes(cb) {
        getPalettesPromise().then(res => {
            paletteTable = res;
            cb && cb();
        }).catch();
    }
    this.doInit = doInit;
    async function doInit() {
        try {
            unitTable = await getAllUnitPromise();
            familyTable = await getAllFamilyPromise();
            updatePalettes();
        } catch (error) {
            setTimeout(doInit, 5000);
        }
    }
    
    this.getPalette = function(palName) {
        if (paletteTable) 
            return paletteTable[palName];
    }
    this.getPalettes = function() {
        return paletteTable;
    }
    this.getFamily = function(idFamily) {
        if (!familyTable) {
            return null;
        }
        return familyTable.find(family => family.idFamily === idFamily);
    }
	this.downloadFileFromDB = downloadFileFromDB;
	function downloadFileFromDB(item, fromURL) {
		return new Promise((resolve, reject) => {
      let storageDatabase = JSON.parse(window.localStorage.getItem('storage_database'))
			$http({
        url: fromURL || ((__cache_file_manager_url || 'https://users.i2g.cloud') + '/download'),
				method: 'POST',
				headers: {
					'Authorization': window.localStorage.getItem('token'),
					'Storage-Database': JSON.stringify(storageDatabase),
					'Content-Type': 'application/json',
					'Referrer-Policy': 'no-referrer',
					'Service': 'WI_PROJECT_STORAGE'
				},
				data: {
					'files': [item.rootIsFile ? item.path : item.path + '/'],
					'skipCompressFile': "true"
				},
				responseType: 'arraybuffer',
			}).then(response => {
				let file = new Blob([response.data], {
					type: 'file'
				});
				self.requesting = false;
				// let fileName = "I2G_Download_" + Date.now() + '_' + Math.floor(Math.random() * 100000) + '.zip';
				file.name = item.rootName;
				console.log(file);
				return resolve(file);

			})
				.catch(err => {
					console.error("file browser error", err);
					if (err.data.code === 401) location.reload();
					return reject()
				});
		});
	}
    this.getFullInfoPromise = getFullInfoPromise;
    function getFullInfoPromise(idProject, owner = null, name = null) {
        let payload = {
            idProject: idProject
        }
        if(owner && name) {
            payload.owner = owner;
            payload.name = name;
            payload.shared = true;
        }
        return postPromise('/project/fullinfo', payload);
    }
    this.getProjectsPromise = getProjectsPromise;
    function getProjectsPromise() {
        return postPromise('/project/list', {});
    }
    this.getPalettesPromise = getPalettesPromise;
    function getPalettesPromise() {
        return postPromise('/pal/all', {});
    }
    this.setBaseUrl = function(baseUrl) {
        __cache_BaseUrl = null;
        window.localStorage.setItem("BASE_URL", baseUrl);
        doInit();
    }
    function getAllUnitPromise() {
        return postPromise('/family/all-unit', {});
    }
    function getAllFamilyPromise() {
        return postPromise('/family/list', {});
    }
    this.getListUnit = getListUnit;
    function getListUnit(payload) {
        return postPromise('/family/list-unit', payload)
    }
    this.getWellsPromise = getWellsPromise;
    function getWellsPromise(idProject) {
        return postPromise('/project/well/list', {idProject: idProject});
    }
    this.listAssetsPromise = listAssetsPromise;
    function listAssetsPromise(idProject, assetType) {
        let payload = {
            idProject: idProject,
            type: assetType
        }
        return postPromise('/project/parameter-set/list', payload);
    }
    this.newAssetPromise = newAssetPromise;
    function newAssetPromise(idProject, name, type, content) {
        let payload = {
            name: name,
            type: type,
            idProject: idProject,
            content: JSON.stringify(content)
        }
        return postPromise('/project/parameter-set/new', payload);
    }
    this.getAssetPromise = getAssetPromise;
    function getAssetPromise(idParameterSet) {
        let payload = {
            idParameterSet: idParameterSet,
        }
        return postPromise('/project/parameter-set/info', payload);
    }
    this.editAssetPromise = editAssetPromise;
    function editAssetPromise(idParameterSet, content) {
        let payload = {
            idParameterSet: idParameterSet,
            content: JSON.stringify(content)
        }
        return postPromise('/project/parameter-set/edit', payload);
    }
    this.getOverlayLinesPromise = getOverlayLinesPromise;
    function getOverlayLinesPromise(idCurveX, idCurveY){
        return postPromise('/project/cross-plot/overlay-line/list/', {idCurveX, idCurveY});
    }
    this.getOverlayLinePromise = getOverlayLinePromise;
    function getOverlayLinePromise(idOverlayLine, idCurveX, idCurveY){
        return postPromise('/project/cross-plot/overlay-line/info/', {idOverlayLine, idCurveX, idCurveY});
    }
     
    this.getWellPromise = getWellPromise;
    function getWellPromise(idWell) {
        return postPromise('/project/well/info', {idWell: idWell});
    }
    const __CACHE_WELL = {};
    this.getCachedWellPromise = getCachedWellPromise;
    function getCachedWellPromise(idWell) {
        let cachedItem = __CACHE_WELL[idWell];
        if (!cachedItem || ( Date.now() - cachedItem.ts ) > CACHE_LIFE_TIME ) {
            cachedItem = cachedItem || {};
            return postPromise('/project/well/info', {idWell}).then((well) => {
                cachedItem.ts = Date.now();
                cachedItem.well = well;
                __CACHE_WELL[idWell] = cachedItem;
                return well;
            });
        }
        return new Promise(function(resolve) {
            cachedItem.ts = Date.now();
            resolve(cachedItem.well);
        });
    }

    this.getZonesetsPromise = getZonesetsPromise;
    function getZonesetsPromise(idWell) {
        return postPromise('/project/well/zone-set/list', {idWell: idWell})
            .then( zonesets => zonesets.map( zs => ({
                ...zs,
                name: zs.zone_set_template.name
            })));
    }
    this.getZonesPromise = getZonesPromise;
    function getZonesPromise(idZoneSet) {
        return postPromise('/project/well/zone-set/info', {idZoneSet: idZoneSet});
    }
    this.getCurveInfoPromise = getCurveInfoPromise;
    function getCurveInfoPromise(idCurve) {
        return postPromise('/project/well/dataset/curve/info', {idCurve});
    }
    this.getDatasetInfoPromise = getDatasetInfoPromise;
    function getDatasetInfoPromise(idDataset) {
        return postPromise('/project/well/dataset/info', {idDataset});
    }
    this.getCurveDataPromise = getCurveDataPromise;
    function getCurveDataPromise(idCurve) {
        return postPromise('/project/well/dataset/curve/getData', {idCurve})
    }
    this.getCurveRawDataPromise = getCurveRawDataPromise;
    function getCurveRawDataPromise(idCurve) {
        return postPromise('/project/well/dataset/curve/getRawData', {idCurve});
    }

    const __CACHE_CURVE = {};
    const CACHE_LIFE_TIME = 10 * 1000;
    this.getCachedCurveDataPromise = getCachedCurveDataPromise;
    function getCachedCurveDataPromise(idCurve) {
        let cachedItem = __CACHE_CURVE[idCurve];
        if (!cachedItem || ( Date.now() - cachedItem.ts ) > CACHE_LIFE_TIME ) {
            cachedItem = cachedItem || {};
          return postPromise('/project/well/dataset/curve/getData', {idCurve})
            .then((dataCurve) => {
              cachedItem.ts = Date.now();
              cachedItem.dataCurve = dataCurve;
              __CACHE_CURVE[idCurve] = cachedItem;
              return dataCurve;
            })
            .catch(err => {
              return err;
            });
        }
        return new Promise(function(resolve) {
            cachedItem.ts = Date.now();
            resolve(cachedItem.dataCurve);
        });
    }

    this.getImageSetsPromise = getImageSetsPromise;
    function getImageSetsPromise(idWell) {
        return postPromise('/project/well/image-set/list', {idWell:idWell});
    }
    this.createImageSetPromise = createImageSetPromise;
    function createImageSetPromise(idWell, name) {
        return postPromise('/project/well/image-set/new', {name, idWell});
    }
    this.renameImageSetPromise = renameImageSetPromise;
    function renameImageSetPromise(name, idImageSet) {
        return postPromise('/project/well/image-set/edit', {name, idImageSet});
    }
    this.createOrGetImageSetPromise = createOrGetImageSetPromise;
    function createOrGetImageSetPromise(idWell, name) {
        return postPromise('/project/well/image-set/new-or-get', {name, idWell});
    }
    this.deleteImageSetPromise = deleteImageSetPromise;
    function deleteImageSetPromise(idImageSet) {
        return postPromise('/project/well/image-set/delete', {idImageSet});
    }
    this.getImageSetPromise = getImageSetPromise;
    function getImageSetPromise(idImageSet) {
        return postPromise('/project/well/image-set/info', {idImageSet});
    }
    this.deleteImagePromise = deleteImagePromise;
    function deleteImagePromise(idImage) {
        return postPromise('/project/well/image-set/image/delete', {idImage});
    }
    this.createImagePromise = createImagePromise;
    function createImagePromise(image) {
        return postPromise('/project/well/image-set/image/new', image);
    }
    this.updateImagePromise = updateImagePromise;
    function updateImagePromise(image) {
        return postPromise('/project/well/image-set/image/edit', image)
    }
    this.uploadImage = uploadImage;
    function uploadImage(image, idImage,successCb, errorCb, progressCb) {
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
    this.deleteImageFilePromise = deleteImageFilePromise;
    function deleteImageFilePromise(imageUrl) {
        return postPromise('/image-delete', {imageUrl: imageUrl});
    }

    this.convertUnit = convertUnit;
    function convertUnit(value, fromUnit, destUnit) {
        if ((!Array.isArray(value) && !_.isFinite(value)) || fromUnit === destUnit) return value;
        if (!unitTable) {
            getAllUnitPromise().then(unittable => unitTable = unittable).catch(err => console.error(err));
            return null;
        }

        let startUnit = unitTable.find(u => u.name == fromUnit);
        let endUnit = unitTable.find(u => u.name == destUnit);

        if(!startUnit || !endUnit || startUnit.idUnitGroup != endUnit.idUnitGroup)
            return value;
        if (startUnit && endUnit) {
            let sCoeffs = JSON.parse(startUnit.rate);
            let eCoeffs = JSON.parse(endUnit.rate);
            function convert(value) {
                return eCoeffs[0]* (value - sCoeffs[1])/sCoeffs[0] + eCoeffs[1];
            }
            if (Array.isArray(value)) {
                return value.map(convert);
            } else {
                return convert(value);
            }
            //return value * endUnit.rate / startUnit.rate;
        }
        else {
            let errUnit = !startUnit ? fromUnit : destUnit;
            console.error(`cannot find ${errUnit} from unit system.`, {silent: true});
            return null;
        }
    }
    this.bestNumberFormat = function(x, digits = 0) {
        if (!x) return x;
        let ex = Math.abs(x / 100);
        let n = -Math.round(Math.log10(ex));
        n = n>=digits?n:digits;
        return (Math.round(x*(10**n))/(10**n)).toFixed(n);
    }
    this.getWellTopDepth = function(well, unit = 'm') {
        let startHdr = well.well_headers.find((wh) => (wh.header === 'STRT'));
        if(!startHdr){
            throw new Error("STRT Well header doesnot exist");
        }
        return convertUnit(parseFloat((startHdr||{}).value || 0), startHdr.unit, unit);
    }
    this.getWellBottomDepth = function(well, unit = 'm') {
        let stopHdr = well.well_headers.find((wh) => (wh.header === 'STOP'));
        if(!stopHdr){
            throw new Error("STOP Well header doesnot exist");
        }
        return convertUnit(parseFloat((stopHdr || {}).value || 0), stopHdr.unit, unit);
    }
    this.evalDiscriminatorPromise = async function(dataset, discriminator) {
        let result = [];
        let length = (dataset.bottom - dataset.top) / dataset.step;
        let curveSet = new Set();
        let curvesData = [];

        let curvesInDataset = dataset.curves;
        if (!curvesInDataset || !discriminator ) return result;

        try {
            findCurve(discriminator, curveSet);

            let curveArr = curvesInDataset.filter(c => Array.from(curveSet).includes(c.name));
            for (let curve of curveArr) {
                let cData = await getCachedCurveDataPromise(curve.idCurve);
                if (!_.isFinite(length))
                    length = cData.length;
                curvesData.push({
                    idCurve: curve.idCurve,
                    name: curve.name,
                    data: cData.map(d => d.x)
                });
            }

            for (let i = 0; i < length; i++) {
                result.push(evaluate(discriminator, i));
            }
            return result;
        }
        catch(e) {
            return Promise.reject(e);
        }
        
        function findCurve(condition, curveSet) {
            if (condition && condition.children && condition.children.length) {
                condition.children.forEach(function (child) {
                    findCurve(child, curveSet);
                })
            } else if (condition && condition.left && condition.right) {
                curveSet.add(condition.left.value);
                if (condition.right.type == 'curve') {
                    curveSet.add(condition.right.value);
                }
            } 
        }

        function evaluate(condition, index) {
            if (condition && condition.children && condition.children.length) {
                let left = evaluate(condition.children[0], index);
                let right = evaluate(condition.children[1], index);
                switch (condition.operator) {
                    case 'and':
                        return left && right;
                    case 'or':
                        return left || right;
                }
            }
            else if (condition && condition.left && condition.right) {
                let leftCurve = curvesData.find(function (curve) {
                    return curve.name == condition.left.value;
                });

                let left = leftCurve ? parseFloat(leftCurve.data[index]) : null;

                let right = condition.right.value;
                if (condition.right.type == 'curve') {
                    let rightCurve = curvesData.find(function (curve) {
                        return curve.name == condition.right.value;
                    })
                    right = rightCurve ? parseFloat(rightCurve.data[index]) : null;
                }

                if (left != null && right != null) {
                    switch (condition.comparison) {
                        case '<':
                            return left < right;
                        case '>':
                            return left > right;
                        case '=':
                            return left == right;
                        case '<=':
                            return left <= right;
                        case '>=':
                            return left >= right;
                    }
                } else {
                    return false;
                }
            } else {
                return true;
            }
        }
    }
    this.getListProjects = function () {
        return postPromise('/project/list', {})
    }
    this.getListWells = function(idProject){
        return postPromise('/project/well/list', {idProject})
    }
    this.getListDatasets = function(idWell){
        return postPromise('/project/well/info', {idWell})
    }
    this.binarySearch = binarySearch;
    function binarySearch(arr, compareFn, start, end) {
        if (start > end) return null;
        let mid=Math.floor((start + end)/2);
        if (compareFn(arr[mid]) == 0) return arr[mid];
        if(compareFn(arr[mid]) < 0)
            return binarySearch(arr, compareFn, start, mid-1);
        else
            return binarySearch(arr, compareFn, mid+1, end);
    }
    this.indexZonesForCorrelation = indexZonesForCorrelation;
    function indexZonesForCorrelation(zones) {
        if (!zones || !zones.length) return;
        let keys = {};
        for(let z of zones) {
            let idx = keys[z.idZoneTemplate];
            if(idx == undefined) idx = 0;
            else idx ++;
            z._idx = idx;
            keys[z.idZoneTemplate] = idx;
        }
    }
    this.indexWellSpecsForCorrelation = indexWellSpecsForCorrelation;
    function indexWellSpecsForCorrelation(wellSpec) {
        if (!wellSpec || !wellSpec.length) return;
        let keys = {};
        for(let well of wellSpec) {
            let idx = keys[well.idWell];
            if(idx == undefined) idx = 0;
            else idx ++;
            well._idx = idx;
            keys[well.idWell] = idx;
        }
    }
    let __cachedDpi = {};
    const CACHING_DPI_INTERVAL_MILLISEC = 1000;
    this.getDpi = getDpi;
    function getDpi(isCached = true) {
        // caching dpi to avoid layout thrashing
        //if(__cachedDpi.value && (Date.now() - __cachedDpi.lastUpdate < CACHING_DPI_INTERVAL_MILLISEC)) {
        if(__cachedDpi.value && isCached) {
            return __cachedDpi.value;
        }

        let inch = document.createElement('inch');
        inch.style = 'height: 1in; width: 1in; left: -100%; position: absolute; top: -100%;';
        document.body.appendChild(inch);
        let devicePixelRatio = window.devicePixelRatio || 1;
        let dpi = inch.clientWidth * devicePixelRatio;
        document.body.removeChild(inch);

        __cachedDpi.value = dpi;
        __cachedDpi.lastUpdate = Date.now();

        return dpi;
    }
    this.mmToPixel = mmToPixel;
    function mmToPixel(mmValue, dpi = 96) {
        return mmValue * getDpi(false) / 25.4;
    }
    this.cmToPixel = cmToPixel;
    function cmToPixel(cmValue) {
        return mmToPixel(cmValue * 10);
    }
    this.pixelTomm = pixelTomm;
    function pixelTomm(pixel, dpi = 96) {
        return pixel * 25.4 / getDpi(false);
    }
    this.pixelToCm = pixelToCm;
    function pixelToCm(pixel, dpi = 96) {
        return pixelTomm(pixel) / 10;
    }
    this.checkCurveExistedPromise = checkCurveExistedPromise;
    function checkCurveExistedPromise(curveName, idDataset) {
        return postPromise('/project/well/dataset/curve/is-existed', { name: curveName, idDataset: idDataset })
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
                }else{
                    reject(new Error(response.data.content))
                }
            }, (err) => {
                if(err) reject(err);
            })
        })
    }
    this.createMlProjectPromise = createMlProjectPromise;
    function createMlProjectPromise(payload) {
        return postPromise('/ml-project/new', payload);
    }
    this.getMlProjectListPromise = getMlProjectListPromise;
    function getMlProjectListPromise() {
        return postPromise('/ml-project/list', {});
    }
    this.deleteMlProjectPromise = deleteMlProjectPromise;
    function deleteMlProjectPromise(idMlProject) {
        return postPromise('/ml-project/delete', {idMlProject: idMlProject})
    }
    this.getMlProjectInfoPromise = getMlProjectInfoPromise;
    function getMlProjectInfoPromise(idMlProject) {
        return postPromise('/ml-project/info', {idMlProject: idMlProject});
    }
    this.editMlProjectPromise = editMlProjectPromise;
    function editMlProjectPromise(payload) {
        return postPromise('/ml-project/edit', payload);
    }

    this.createLogplotPromise = createLogplotPromise;
    function createLogplotPromise(payload) {
        return postPromise('/project/plot/new', payload);
    }
    this.createDepthTrackPromise = createDepthTrackPromise;
    function createDepthTrackPromise(payload) {
        return postPromise('/project/plot/depth-axis/new', payload);
    }
    this.createLogTrackPromise = createLogTrackPromise;
    function createLogTrackPromise(payload) {
        return postPromise('/project/plot/track/new', payload);
    }
    this.createLinePromise = createLinePromise;
    function createLinePromise(payload) {
        return postPromise('/project/plot/track/line/new', payload);
    }
    this.editLinePromise = editLinePromise;
    function editLinePromise(payload) {
        return postPromise('/project/plot/track/line/edit', payload);
    }
    this.getProjectInfoPromise = getProjectInfoPromise;
    function getProjectInfoPromise(idProject) {
        return postPromise('/project/info', {idProject});
    }
    this.login = login;
    function login(data) {
        const authenticationUrl = window.localStorage.getItem('AUTHENTICATION_SERVICE') || "http://admin.dev.i2g.cloud";
        return postPromise('/login', data, { noToken: true, baseUrl: authenticationUrl });
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
    this.listWellsPromise = listWellsPromise;
    function listWellsPromise(payload) {
        return postPromise('/user/wells', payload, {service: 'WI_INVENTORY'});
    }
    this.createStorageFilterPromise = createStorageFilterPromise;
    function createStorageFilterPromise(payload) {
        return postPromise('/filter/new', payload, {service: 'WI_BACKEND'});
    }
    this.listStorageFilterPromise = listStorageFilterPromise;
    function listStorageFilterPromise(payload) {
        return postPromise('/filter/list', payload, {service: 'WI_BACKEND'});
    }
    this.infoStorageFilterPromise = infoStorageFilterPromise;
    function infoStorageFilterPromise(payload) {
        return postPromise('/filter/info', payload, {service: 'WI_BACKEND'});
    }
    this.deleteStorageFilterPromise = deleteStorageFilterPromise;
    function deleteStorageFilterPromise(payload) {
        return postPromise('/filter/delete', payload, {service: 'WI_BACKEND'});
    }
    this.editStorageFilterPromise = editStorageFilterPromise;
    function editStorageFilterPromise(payload) {
        return postPromise('/filter/edit', payload, {service: 'WI_BACKEND'});
    }
    this.listZoneSetTemplatePromise = listZoneSetTemplatePromise;
    function listZoneSetTemplatePromise(payload) {
        return postPromise('/zone-set-template/list', payload, {service: 'WI_BACKEND'});
    }
    this.deleteZoneSetTemplatePromise = deleteZoneSetTemplatePromise;
    function deleteZoneSetTemplatePromise(payload) {
        return deletePromise('/zone-set-template/delete', payload, {service: 'WI_BACKEND'});
    }
    this.createZoneSetTemplatePromise = createZoneSetTemplatePromise;
    function createZoneSetTemplatePromise(payload) {
        return postPromise('/zone-set-template/new', payload, {service: 'WI_BACKEND'});
    }
    this.createZoneTemplatePromise = createZoneTemplatePromise;
    function createZoneTemplatePromise(payload) {
        return postPromise('/zone-set-template/zone-template/new', payload, {service: 'WI_BACKEND'});
    }
    this.removeZoneSetPromise = removeZoneSetPromise;
    function removeZoneSetPromise(payload) {
        return postPromise('/project/well/zone-set/delete', payload, {service: 'WI_BACKEND'});
    }
    this.createZoneSetPromise = createZoneSetPromise;
    function createZoneSetPromise(payload) {
        return postPromise('/project/well/zone-set/new', payload, {service: 'WI_BACKEND'});
    }
    this.getZoneSetPromise = getZoneSetPromise;
    function getZoneSetPromise(payload) {
        return postPromise('/project/well/zone-set/info', payload, {service: 'WI_BACKEND'});
    }
    this.createZonePromise = createZonePromise;
    function createZonePromise(payload) {
        return postPromise('/project/well/zone-set/zone/new', payload, {service: 'WI_BACKEND'});
    }

    this.listMarkerSetTemplatePromise = listMarkerSetTemplatePromise;
    function listMarkerSetTemplatePromise(payload) {
        return postPromise('/marker-set-template/list', payload);
    }
    this.removeMarkerSetTemplatePromise = removeMarkerSetTemplatePromise;
    function removeMarkerSetTemplatePromise(payload) {
        return deletePromise('/marker-set-template/delete', payload);
    }
    this.createMarkerSetTemplatePromise = createMarkerSetTemplatePromise;
    function createMarkerSetTemplatePromise(payload) {
        return postPromise('/marker-set-template/new', payload);
    }
    this.createMarkerTemplatePromise = createMarkerTemplatePromise;
    function createMarkerTemplatePromise(payload) {
        return postPromise('/marker-set-template/marker-template/new', payload);
    }
    this.listMarkerSetPromise = listMarkerSetPromise;
    function listMarkerSetPromise(payload) {
        return postPromise('/project/well/marker-set/list', payload);
    }
    this.removeMarkerSetPromise = removeMarkerSetPromise;
    function removeMarkerSetPromise(payload) {
        return deletePromise('/project/well/marker-set/delete', payload);
    }
    this.createMarkerSetPromise = createMarkerSetPromise;
    function createMarkerSetPromise(payload) {
        return postPromise('/project/well/marker-set/new', payload);
    }
    this.createMarkerPromise = createMarkerPromise;
    function createMarkerPromise(payload) {
        return postPromise('/project/well/marker-set/marker/new', payload);
    }
    //doInit();
    this.getImage = function (url) {
        return get(url, {config: {responseType: 'blob'}}).then(res => URL.createObjectURL(res));
    }
    this.createZoneTrackPromise = createZoneTrackPromise;
    function createZoneTrackPromise(payload) {
        return postPromise('/project/plot/zone-track/new', payload)
    }
    this.getWellFullInfoPromise = getWellFullInfoPromise;
    function getWellFullInfoPromise(idWell) {
        return postPromise('/project/well/full-info', {idWell});
    }
    this.getWellDepth = getWellDepth
    function getWellDepth(idWell) {
        return this.getWellFullInfoPromise(idWell)
        .then(well => {
            let { datasets } = well;
            let topDepth = Math.min(...datasets.map(d => +d.top));
            let bottomDepth = Math.max(...datasets.map(d => +d.bottom));
            return new Promise(resolve => resolve({ topDepth, bottomDepth }));
        })
    }
    const __CACHE_DEPTH = {}
    this.getCachedWellDepth = getCachedWellDepth;
    async function getCachedWellDepth(idWell) {
        let cachedItem = __CACHE_DEPTH[idWell]
        if(!cachedItem || (Date.now() - cachedItem.ts ) > CACHE_LIFE_TIME) {
            cachedItem = cachedItem || {}
            cachedItem.ts = Date.now();
            cachedItem.depth = {};
            // let { datasets } = await this.getWellFullInfoPromise(idWell)
            return this.getWellFullInfoPromise(idWell)
            .then(well => {
                let { datasets } = well;
                cachedItem.depth.topDepth = Math.min(...datasets.map(d => +d.top));
                cachedItem.depth.bottomDepth = Math.max(...datasets.map(d => +d.bottom));
                __CACHE_DEPTH[idWell] = cachedItem;
                return cachedItem;
            })
        }else {
            return new Promise(res => res(cachedItem));
        }
    }
}
