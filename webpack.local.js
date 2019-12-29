const path = require('path');
const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
module.exports = {
	context: __dirname + '/src',
	mode: "development",
	entry: {
		main: "./index.js",
	},
	output: {
		path: path.resolve(__dirname, '../wi-angular/watch/bower_components/misc-component/dist'),
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
