let helper = require('../DialogHelper');
module.exports = function (ModalService, idProject, imgSetName, callback) {
    function ModalController($scope, $timeout, $element, wiApi, close) {
        const self = this;
        self.selectedIdx = -1;
        this.imgSetName = imgSetName;
        this.uploadedImages = [];
        this.selectedImage = null;
        this.selected = false;
        this.imageUrl = "";
        this.showImage = false;
        this.uploadFileList = [];
        this.arrayPattern = [];
        this.patterns = ['WELLNAME','FILL','DEPTH','UNIT','SPEC','TOPDEPTH','BOTDEPTH','RIGHT','LEFT'];
        this.inputPattern = '';
        this.wells = null;
        wiApi.getWellsPromise(idProject).then(wells => self.wells = wells).catch(err => console.error(err));

        function getImageName(img) {
            let _DIVIDER;
            if (img.match('/') != null) {
                _DIVIDER = '/';
            } else {
                _DIVIDER = '\\';
            }
            return img.split(_DIVIDER).pop();
        }
        /*
        this.selectImage = function (image) {
            self.selectedImage = image;
            self.selected = true;
            self.imageUrl = image.imageUrl;
            self.done = true;
            // self.arePropsChanged = true;
        }
        */
        this.setImgSetName = function(notuse, name) {
            self.imgSetName = name;
        }
        this.focusPatternList = function() {
            $timeout(() => $element.find('.pattern-list')[0].focus(), 100);
        }
        this.selectPattern = function (pattern) {
            if( this.inputPattern ) {
                if(this.inputPattern[this.inputPattern.length - 1] == '%') {
                    this.inputPattern += pattern + '%';
                } else this.inputPattern +='%' + pattern + '%';
            } else {
                this.inputPattern +='%'+ pattern + '%';
            }
            this.updateInformation();
        }
        this.addForUpload = function(files) {
        	if (files && files.length) {
                for(let i in files){
                    preProcessImage(files[i],this.inputPattern);
                    files[i].uploaded = false;
                        this.uploadFileList.push(files[i]);
                    console.log(files[i]);
                }
        	}
        }
        this.updateInformation = function() {
            for(let i in this.uploadFileList) {
                for(let j in this.uploadFileList[i].information.arrayPattern) {
                    delete this.uploadFileList[i].information[this.uploadFileList[i].information.arrayPattern[j]];
                    delete this.uploadFileList[i].information.MORE;
                }
                this.uploadFileList[i].information.arrayPattern = [];
                processUpdate(this.uploadFileList[i],this.inputPattern)
                console.log(this.uploadFileList[i]);

            }
        }
        this.removeFromUpload = function (index) {
            this.uploadFileList.splice(index,1);
            this.showImage = false;
        }
        this.uploadFiles = function () {
           	doUploadFiles(this.uploadFileList);
            this.uploadFileList = [];
            this.showImage = false;
        }

        async function doUploadFiles(files) {
            for (let file of files) {
                console.log(file.information.arrayPattern);
                let well = self.wells
                    .find(w => w.name === file.information.WELLNAME || w.alias === file.information.WELLNAME);

                if (well) {
                    try {
                        if (!well.imageSet) {
                            well.imageSet = await wiApi.createOrGetImageSetPromise(well.idWell, self.imgSetName);
                        }
                        let image = await wiApi.createImagePromise(imageObject(file, well.imageSet.idImageSet));
                        wiApi.uploadImage(file, image.idImage, (imgUrl) => {
                            image.imageUrl = imgUrl;
                            wiApi.updateImagePromise(image);
                        }, (err) => {console.error(err)}, (evt) => {});
                    }
                    catch(err) {
                        console.error(err);
                    }
                }
            }
        }

        function imageObject(uploadFile, idImageSet) {
            return {
                name: uploadFile.name,
                topDepth: uploadFile.information['TOPDEPTH'] || uploadFile.information['DEPTH'],
                bottomDepth: uploadFile.information['BOTTOMDEPTH'] || (uploadFile.information['DEPTH'] + 10),
                idImageSet: idImageSet,
                imageUrl: null
            }
        }
        this.getValue = function([image, brand]) {
            switch(brand) {
                case "WELLNAME":
                    return image.information[brand];
                case "DEPTH":
                case "TOPDEPTH":
                case "BOTTOMDEPTH":
                    return wiApi.bestNumberFormat(
                        wiApi.convertUnit(
                            parseFloat(image.information[brand]), 'm', self.getValue([image,'UNIT'])
                        ), 3
                    );
                case "UNIT":
                    return image.information[brand] || 'm';
                default:
            }
        }
        this.setValue = function([image, brand], newValue) {
            switch(brand) {
                case "WELLNAME":
                    image.information[brand] = newValue;
                    break;
                case "DEPTH":
                case "TOPDEPTH":
                case "BOTTOMDEPTH":
                    image.information[brand] = wiApi.convertUnit(
                        parseFloat(newValue), self.getValue([image, 'UNIT']), 'm'
                    );
                    break;
                case "UNIT":
                    let value = newValue.toLowerCase();
                    if (value === "m" || value === 'ft') {
                        image.information[brand] = value;
                    }
                    break;
            }
        }
        this.isValid = function(brand, img) {
            switch (brand) {
                case "WELLNAME":
                    let well = self.wells.find(w => 
                        w.name === img.information[brand] || w.alias === img.information[brand]
                    );
                    return well?'green':'red';
                case "DEPTH":
                case "TOPDEPTH":
                case "BOTTOMDEPTH":
                    return 'green';
                case "UNIT":
                    let value = self.getValue([img, brand]);
                    return (value === "m" || value === 'ft')? 'green':'red';
            }
        }
        this.closeModal = function () {
            close(null);
        }
        this.showFileUpload = function(src) {
            this.src = src;
            this.showImage = true;
        }
        function preProcessImage(file,pattern) {
            pattern = pattern.toUpperCase();
            pattern = pattern.replace(/MORE/g,'');
            // pattern = pattern.replace('more','');
            pattern = formatString(pattern);
            if(!pattern) pattern = 'WELLNAME%DEPTH%UNIT';
            else if (pattern[0] == '%' && pattern[pattern.length - 1] == '%') pattern = pattern.slice(1, pattern.length - 1);
            else if (pattern[0] == '%' ) pattern = pattern.slice(1,pattern.length);
            else if (pattern[pattern.length - 1] == '%') pattern = pattern.slice(0, pattern.length - 1 );

            var reader = new FileReader();

            let indexOfExt = file.name.lastIndexOf('.');
            let stringProcess = file.name.toUpperCase().slice(0,indexOfExt);
            let arrayPatternProcess = pattern.split('%');

            console.log(arrayPatternProcess);

            let arrayStringProcess = stringProcess.split('-'); 
            let arrayPattern = [];
            file.information = {};
            arrayPatternProcess = removeDuplicates(arrayPatternProcess);

            if( arrayStringProcess.length > arrayPatternProcess.length ) {
                for(let i in arrayPatternProcess ) {
                    file.information[arrayPatternProcess[i]] = arrayStringProcess[i] || '';
                    arrayPattern.push(arrayPatternProcess[i]);
                }
                file.information['MORE'] = [];
                for(let i = arrayPatternProcess.length; i < arrayStringProcess.length; i++ )  {
                    file.information['MORE'].push(arrayStringProcess[i]);
                }
            } else {
                for(let i in arrayPatternProcess ) {
                    file.information[arrayPatternProcess[i]] = arrayStringProcess[i] || '';
                    arrayPattern.push(arrayPatternProcess[i]);
                }
            }

            file.information.arrayPattern = arrayPattern;
            reader.onload = function(data){
                var src = data.target.result;
                file.src = src;
            }
            reader.readAsDataURL(file);
        }
        function processUpdate(file, pattern) {
            pattern = pattern.toUpperCase();
            pattern = pattern.replace(/MORE/g,'');
            // pattern = pattern.replace('more','');
            pattern = formatString(pattern);
            if(!pattern) pattern = 'WELLNAME%DEPTH%UNIT';
            else if (pattern[0] == '%' && pattern[pattern.length - 1] == '%') pattern = pattern.slice(1,pattern.length-1);
            else if (pattern[0] == '%' ) pattern = pattern.slice(1,pattern.length);
            else if (pattern[pattern.length - 1] == '%') pattern = pattern.slice(0,pattern.length-1);

            let indexOfExt = file.name.lastIndexOf('.');
            let stringProcess = file.name.toUpperCase().slice(0,indexOfExt);
            // let patternProcess = pattern.toUpperCase();
            let arrayPatternProcess = pattern.split('%');

            // console.log(arrayPatternProcess);

            let arrayStringProcess = stringProcess.split('-'); 
            let arrayPattern = [];
            file.information = {};
            arrayPatternProcess = removeDuplicates(arrayPatternProcess);
            if( arrayStringProcess.length > arrayPatternProcess.length ) {
                for(let i in arrayPatternProcess ) {
                    file.information[arrayPatternProcess[i]] = arrayStringProcess[i] || '';
                    arrayPattern.push(arrayPatternProcess[i]);
                }
                file.information['MORE'] = [];
                for(let i = arrayPatternProcess.length; i < arrayStringProcess.length; i++ )  {
                    file.information['MORE'].push(arrayStringProcess[i]);
                }
            } else {
                for(let i in arrayPatternProcess ) {
                    file.information[arrayPatternProcess[i]] = arrayStringProcess[i] || '';
                    arrayPattern.push(arrayPatternProcess[i]);
                }
            }
            file.information.arrayPattern = arrayPattern;
        }
        function formatString(pattern) {
            let myPattern = '';
            for (let i = 0 ; i < pattern.length - 1; i++ ) {
                if( pattern[i] != '%' || pattern[i - 1 ] !='%' || i < 1 ) {
                    myPattern += pattern[i];
                }
            }
            console.log(myPattern);
            return myPattern;
        }
        function removeDuplicates(a) {
            return Array.from(new Set(a));
        }
    }

    ModalService.showModal({
        template: require("./import-images-modal.html"),
        controller: ModalController,
        controllerAs: 'self'
    }).then(function (modal) {
        helper.initModal(modal);
        modal.close.then(function (ret) {
            helper.removeBackdrop();
            ret && callback && callback(ret);
        });
    });
}
