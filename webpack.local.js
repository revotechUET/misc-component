const path = require('path');
const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const output = path.resolve(__dirname, '../wi-angular/watch/bower_components/misc-component/dist');
//const output = path.resolve(__dirname, '../i2g-data-administrator/public/bower_components/misc-component/dist');
module.exports = {
	context: __dirname + '/src',
	mode: "development",
	entry: {
		main: "./index.js",
	},
	output: {
		path: output,
		filename: 'misc-components.js'
	},
	module: {
		rules: [{
				test: /\.html$/,
				use: ['html-loader']
			}, {
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.less$/,
				use: ['style-loader','css-loader','less-loader'],
			}
		],
	},
    plugins: [
        new HardSourceWebpackPlugin()
    ]
	
}
