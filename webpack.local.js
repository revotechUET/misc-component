const path = require('path');
const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const output = path.resolve(__dirname, '../wi-angular/watch/bower_components/misc-component/dist');
//const output = path.resolve(__dirname, '../base-map/bower_components/misc-component/dist');
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
		rules: [
			{
				enforce: 'pre',
				test: /\.js$/,
				include: [
					path.resolve(__dirname, './src')
				],
				exclude: /vendor/,
				use: [
					{
						loader: 'eslint-loader',
						options: {
							cache: true,
							quiet: true,
							parserOptions: {
								ecmaVersion: 11,
							}
						},
					},
				],
			},
			{
				test: /\.html$/,
				use: ['html-loader']
			}, {
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.less$/,
				use: ['style-loader', 'css-loader', 'less-loader'],
			}
		],
	},
	plugins: [
		new HardSourceWebpackPlugin(),
	]
}
