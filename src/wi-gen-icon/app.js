const path = require('path');
const fs = require('fs/promises');
const svgToDataURL = require('svg-to-dataurl');
const arrayToTxtFile = require('array-to-txt-file');

const directoryPath = path.join(__dirname, './icon-svg');
var array = [];

createCss().then(() => {
    writeCss();
})

async function createCss() {
    const files = await fs.readdir(directoryPath);
    files.sort((a, b) => a.localeCompare(b)); // ensure order cross platform
    console.log(files);
    for (const file of files) {
        if (!file.endsWith('.svg')) continue;
        const data = await fs.readFile(path.join(directoryPath, file), 'utf-8');
        let dataUrl = "background-image: url('" + svgToDataURL(data) + "');";
        let fileName = file.split("_").join("-");
        fileName = fileName.split(".svg").join("");
        if (fileName.search(/32x32/) !== -1) {
            let addCss = "background-repeat: no-repeat;display: inline-block !important; overflow: hidden;text-indent: -9999px;text-align: left;width: 32px;height: 32px;"
            let css = "." + fileName + "," + "." + fileName + "\\" + ":regular{" + dataUrl + addCss + "}";
            console.log(fileName);
            array.push(css);
        } else {
            let addCss = "background-repeat: no-repeat;display: inline-block !important; overflow: hidden;text-indent: -9999px;text-align: left;width: 16px;height: 16px;"
            let css = "." + fileName + "," + "." + fileName + "\\" + ":regular{" + dataUrl + addCss + "}";
            console.log(fileName);
            array.push(css);
        }
    }
}

function writeCss(time) {
    arrayToTxtFile(array, path.resolve(__dirname, '../wi-icons/sprite.less'), err => {
        if (err) {
            console.error(err)
            return;
        }
        console.log('CREATED STYLE')
    })
}
