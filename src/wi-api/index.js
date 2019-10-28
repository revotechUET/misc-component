const serviceName = 'wiApi';
angular.module(serviceName, ['wiToken', 'ngFileUpload']).factory(serviceName, function($http, wiToken, Upload, $timeout) {
    return new wiApiService($http, wiToken, Upload, $timeout);
});

function wiApiService($http, wiToken, Upload, $timeout) {
    let self = this;
    this.$http = $http;
    this.baseUrl = window.localStorage.getItem('__BASE_URL') || 'http://dev.i2g.cloud';
    let unitTable = undefined;
    let familyTable;
    let paletteTable;
    this.getFamilyTable = () => familyTable
    this.getUnitTable = () => unitTable;
    function postPromise(url, data, opts = {}) {
        return new Promise(function(resolve, reject) {
            const salt = "wi-hash";
            const baseUrl = opts.baseUrl || self.baseUrl;
            const headers = opts.noToken ? {} : {
                Authorization: wiToken.getToken(),
                'Service': 'WI_BACKEND'
            };
            const payloadHash = genPayloadHash((data || {}), SHA256(salt + wiToken.getToken()));
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

    getAllUnitPromise().then(unittable => unitTable = unittable).catch(err => console.error(err));

    this.updatePalettes = updatePalettes;
    function updatePalettes(cb) {
        getPalettesPromise().then(paltable => {
            paletteTable = paltable;
            cb && cb();
        }).catch(err => console.error(err));
    }
    updatePalettes();
    
    getAllFamilyPromise()
        .then(familytable => {
                        familyTable = familytable;
        }).catch(err => console.error(err));
    
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
        self.baseUrl = baseUrl;
    }
    function getAllUnitPromise() {
        return postPromise('/family/all-unit', {});
    }
    function getAllFamilyPromise() {
        return postPromise('/family/list', {});
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

    const __CACHE_CURVE = {};
    const CACHE_LIFE_TIME = 10 * 1000;
    this.getCachedCurveDataPromise = getCachedCurveDataPromise;
    function getCachedCurveDataPromise(idCurve) {
        let cachedItem = __CACHE_CURVE[idCurve];
        if (!cachedItem || ( Date.now() - cachedItem.ts ) > CACHE_LIFE_TIME ) {
            cachedItem = cachedItem || {};
            return postPromise('/project/well/dataset/curve/getData', {idCurve}).then((dataCurve) => {
                cachedItem.ts = Date.now();
                cachedItem.dataCurve = dataCurve;
                __CACHE_CURVE[idCurve] = cachedItem;
                return dataCurve;
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
            url: self.baseUrl + '/image-upload',
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
            url: self.baseUrl + route,
            headers: {
                'Referrer-Policy': 'no-referrer',
                Authorization: wiToken.getToken(),
                'Service': 'WI_BACKEND'
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
}

function SHA256(s){
    var chrsz   = 8;
    var hexcase = 0;
    function safe_add (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
    function R (X, n) { return ( X >>> n ); }
    function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
    function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
    function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
    function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
    function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
    function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
    function core_sha256 (m, l) {
        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;
        for ( var i = 0; i<m.length; i+=16 ) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];
            for ( var j = 0; j<64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }
            HASH[0] = safe_add(a, HASH[0]);
            HASH[1] = safe_add(b, HASH[1]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            HASH[5] = safe_add(f, HASH[5]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }
    function str2binb (str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
        }
        return bin;
    }
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
    function binb2hex (binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
            hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
        }
        return str;
    }
    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}
function genPayloadHash(payload, salt) {
    return SHA256(JSON.stringify(payload) + salt);
}