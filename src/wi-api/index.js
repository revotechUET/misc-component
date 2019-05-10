const serviceName = 'wiApi';
angular.module(serviceName, ['wiToken', 'ngFileUpload']).factory(serviceName, function($http, wiToken, Upload) {
    return new wiApiService($http, wiToken, Upload);
});

function wiApiService($http, wiToken, Upload) {
    let self = this;
    this.$http = $http;
    this.baseUrl = 'http://dev.i2g.cloud';
    let unitTable = undefined;
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

    this.setBaseUrl = function(baseUrl) {
        self.baseUrl = baseUrl;
    }
    function getAllUnitPromise() {
        return postPromise('/family/all-unit', {});
    }

    this.getWellsPromise = getWellsPromise;
    function getWellsPromise(idProject) {
        return postPromise('/project/well/list', {idProject: idProject});
    }
    this.getImageSetsPromise = getImageSetsPromise;
    function getImageSetsPromise(idWell) {
        return postPromise('/project/well/image-set/list', {idWell:idWell});
    }
    this.createImageSetPromise = createImageSetPromise;
    function createImageSetPromise(idWell, name) {
        return postPromise('/project/well/image-set/new', {name, idWell});
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
    function uploadImage(image, successCb, errorCb, progressCb) {
        return Upload.upload({
            url: self.baseUrl + '/image-upload',
            headers: {
                Authorization: wiToken.getToken()
            },
            data: {
                file: image
            }
        }).then(
            resp => successCb(resp.data.content),
            resp => errorCb(resp), 
            evt => progressCb(parseFloat(100.0 * evt.loaded / evt.total))
        ).catch(err => errorCb(err));
    }

    this.convertUnit = convertUnit;
    function convertUnit(value, fromUnit, destUnit) {
        if ((!Array.isArray(value) && !_.isFinite(value)) || fromUnit === destUnit) return value;
        if (!unitTable) {
            return null;
            /*try {
                unitTable = await getAllUnitPromise();
            }
            catch(err) {
                console.error(err);
                return null;
            }*/
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
}
