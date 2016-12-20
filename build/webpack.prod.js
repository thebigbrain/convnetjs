const path = require('path')
const webpackBaseConfig = require('./webpack.base')
const webpackMerge = require('webpack-merge')

const config = webpackMerge(webpackBaseConfig, {
	devtool: 'source-map'
})

module.exports = config