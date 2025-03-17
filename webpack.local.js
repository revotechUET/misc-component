const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

// const output = path.resolve(__dirname, '../wi-machine-learning/public/bower_components/misc-component/dist');
// const output = path.resolve(__dirname, '../wi-angular/watch/bower_components/misc-component/dist');
//const output = path.resolve(__dirname, '../base-map/bower_components/misc-component/dist');
const output = path.resolve(__dirname, '../wi-angular/watch/packages/@revotechuet/misc-component-1.4.13');
module.exports = {
	extends: path.resolve(__dirname, './webpack.config.js'),
	output: {
		path: output,
	},
	plugins: [
		new ESLintPlugin({
			context: './src',
			cache: true,
			// quiet: true,
		}),
	]
}
