const componentName = 'imageTable';
const moduleName = 'image-table';
var angular = require('angular');
function ImageStableController() {
    const self = this;
    this.showImage = false;
    this.uploadFileList = [];
    this.arrayPattern = [];
    this.patterns = ['WELLNAME','DETPH','UNIT'];
    this.inputPattern = '';
    this.addForUpload = function (files) {
        this.isShow = false;
        if (files && files.length) {
            for(let i in files){
                preProcessImage(files[i],this.inputPattern);
                    this.uploadFileList.push(files[i]);
                console.log(files[i]);
            }
            // this.uploadFileList = this.uploadFileList.concat(files);
        }
        console.log(this.uploadFileList);
    }
    this.isShow = false;
    this.toggleShow = function() {
        this.isShow = !this.isShow;
    }
    this.selectPattern = function (pattern) {
        // console.log('On Click');
        if( this.inputPattern ) {
            if(this.inputPattern[this.inputPattern.length - 1] == '%') {
                this.inputPattern += pattern + '%';
            } else this.inputPattern +='%' + pattern + '%';
        } else {
            this.inputPattern +='%'+ pattern + '%';
        }
        this.updateInformation();
    }
    this.updateInformation = function() {
        for(i in this.uploadFileList) {
            for(j in this.uploadFileList[i].information.arrayPattern) {
                delete this.uploadFileList[i].information[this.uploadFileList[i].information.arrayPattern[j]];
                delete this.uploadFileList[i].information.MORE;
            }
            this.uploadFileList[i].information.arrayPattern = [];
            processUpdate(this.uploadFileList[i],this.inputPattern)
            console.log(this.uploadFileList[i]);

        }
        // console.log('On Blur');
    } 
    this.removeFromUpload = function (index) {
        this.uploadFileList.splice(index,1);
    }
    this.showFileUpload = function(src) {
        this.src = src;
        this.showImage = true;
    }
    var preProcessImage = function(file,pattern) {
        pattern = pattern.toUpperCase();
        pattern = pattern.replace(/MORE/g,'');
        // pattern = pattern.replace('more','');
        pattern = formatString(pattern);
        if(!pattern) pattern = 'WELLNAME%DETPH%UNIT';
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
    var processUpdate = function(file, pattern) {
        pattern = pattern.toUpperCase();
        pattern = pattern.replace(/MORE/g,'');
        // pattern = pattern.replace('more','');
        pattern = formatString(pattern);
        if(!pattern) pattern = 'WELLNAME%DETPH%UNIT';
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
    var formatString = function (pattern) {
        let myPattern = '';
        for (let i = 0 ; i < pattern.length - 1; i++ ) {
            if( pattern[i] != '%' || pattern[i - 1 ] !='%' || i < 1 ) {
                myPattern += pattern[i];
            }
        }
        console.log(myPattern);
        return myPattern;
        // pattern = myPattern
        // angular.copy(pattern,) ;
    }
    var removeDuplicates = function (a) {
        return Array.from(new Set(a));
    }
}

let app = angular.module(moduleName, []);

app.component(componentName, {
    template: require('html-loader!./image-table.html'),
    controller: ImageStableController,
    controllerAs: 'self',
    bindings: {
        uploadFileList: '=',
    }
});
exports.name = moduleName;