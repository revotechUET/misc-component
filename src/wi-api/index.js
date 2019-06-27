const serviceName = 'wiApi';
angular.module(serviceName, ['wiToken', 'ngFileUpload']).factory(serviceName, function($http, wiToken, Upload) {
    return new wiApiService($http, wiToken, Upload);
});

function wiApiService($http, wiToken, Upload) {
    let self = this;
    this.$http = $http;
    this.baseUrl = window.localStorage.getItem('__BASE_URL') || 'http://dev.i2g.cloud';
    let unitTable = undefined;
    let familyTable;
    
    this.getUnitTable = () => unitTable
    this.getFamilyTable = () => familyTable

    function postPromise(url, data) {
        return new Promise(function(resolve, reject) {
            $http({
                method: 'POST',
                url: self.baseUrl + url,
                data: data,
                headers: {
                    Authorization: wiToken.getToken()
                }
            }).then((response) => {
                if (response.data.code === 200) resolve(response.data.content);
                else reject(new Error(response.data.reason));
            }, (err) => {
                reject(err);
            })
        });
    }

    getAllUnitPromise().then(unittable => unitTable = unittable).catch(err => console.error(err));
    getAllFamilyPromise()
        .then(familytable => (
            familyTable = familytable
        )).catch(err => console.error(err));
    
    this.getFamily = function(idFamily) {
        if (!familyTable) {
            getAllFamilyPromise()
                .then(familytable => (
                    familyTable = familytable
                )).catch(err => console.error(err));
            return null;
        }
        return familyTable.find(family => family.idFamily === idFamily);
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
                Authorization: wiToken.getToken()
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
}
