const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 */
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
	module: {
		rules: [
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
		new ESLintPlugin({
			context: path.resolve(__dirname, './src'),
			cache: true,
			quiet: true,
		}),
	],
}
