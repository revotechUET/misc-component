const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const path = require('path');

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
