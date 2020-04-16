import path from 'path';
import fs from 'fs';
import svgToDataURL from 'svg-to-dataurl';
const directoryPath = path.join("../../", 'icon-svg');
import arrayToTxtFile from 'array-to-txt-file';
var array = [];

creatCss();
writeCss(10000);

function creatCss() {
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            if (file !== ".DS_Store") {
                fs.readFile("../../icon-svg/" + file, 'utf-8', (err, data) => {
                    if (err) throw err;
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
                });
            }
        });
    });

}

function writeCss(time) {
    setTimeout(function () {
        arrayToTxtFile(array, '../wi-icons/sprite.less', err => {
            if (err) {
                console.error(err)
                return;
            }
            console.log('C   R   E   A   T   E  D    S   T   Y   L   E')
        })
    }, time)

}