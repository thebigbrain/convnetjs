const path = require('path')
const webpackBaseConfig = require('./webpack.base')
const webpackMerge = require('webpack-merge')

const config = webpackMerge(webpackBaseConfig, {
	devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: path.resolve('dist'),
        filename: 'convnet.js',
        historyApiFallback: true,
        compress: true,
        port: 9000
    }
})

module.exports = config