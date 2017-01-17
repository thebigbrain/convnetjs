const path = require('path')
const FlowBabelWebpackPlugin = require('flow-babel-webpack-plugin')

const config = {
    target: 'node',
    context: path.resolve(__dirname, '../'),
    entry: path.resolve('src/index.js'),
    output: {
        path: path.resolve('dist'),
        filename: 'convnet.js',
        library: 'convnetjs',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            { test: /\.(js|es6)$/, use: 'babel-loader' }
        ]
    },
    plugins: [
      new FlowBabelWebpackPlugin()
    ]
};

module.exports = config
