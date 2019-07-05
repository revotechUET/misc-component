#!/bin/bash
npx webpack 
rm ../multi-well-histogram/bower_components/misc-component/dist/misc-components.js
cp ./dist/misc-components.js ../multi-well-histogram/bower_components/misc-component/dist/