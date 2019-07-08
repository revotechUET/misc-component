#!/bin/bash
npx webpack 
rm ../multi-well-histogram/bower_components/misc-component/dist/misc-components.js
cp ./dist/misc-components.js ../multi-well-histogram/bower_components/misc-component/dist/

rm ../image-set-manager/bower_components/misc-component/dist/misc-components.js
cp  ./dist/misc-components.js  ../image-set-manager/bower_components/misc-component/dist/misc-components.js


rm ../base-map/bower_components/misc-component/dist/misc-components.js
cp  ./dist/misc-components.js  ../base-map/bower_components/misc-component/dist/misc-components.js


rm ../multi-well-crossplot/bower_components/misc-component/dist/misc-components.js
cp  ./dist/misc-components.js  ../multi-well-crossplot/bower_components/misc-component/dist/misc-components.js

