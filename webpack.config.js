const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
	context: __dirname + '/src',
	mode: "development",
	entry: {
		main: "./index.js",
	},
	output: {
		path: __dirname + '/dist',
		// path: __dirname + '../../multi-well-crossplot/bower_components/misc-component/dist',
		filename: 'misc-components.js'
	},
	resolve: {
		extensions: ['*', '.js', '.vue', '.json'],
		alias: {
			'vue$': 'vue/dist/vue.min.js'
		}
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
				test: /\.vue$/,
				use: 'vue-loader',
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
		new VueLoaderPlugin(),
	],
}
