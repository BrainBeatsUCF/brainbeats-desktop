var path = require('path');
var HtmlWebpackPlugin =  require('html-webpack-plugin');

module.exports = {
    entry : './public/index.js',
    output : {
        path : path.resolve(__dirname , 'dist'),
        filename: 'index_bundle.js'
    },
    
    module : {
        rules : [
            {test : /\.(js)$/, use:'babel-loader'},
            {test : /\.css$/, use:['style-loader', 'css-loader']},
            {test : /\.(png|svg|jpe?g|gif)$/i, use: 'file-loader'},
            {test : /\.(mp3|wav|wma|ogg)$/, use: 'file-loader'},
            {test : /\.(mp4|webm)$/, use: 'file-loader'}
        ]
    },
    mode:'development',
    plugins : [
        new HtmlWebpackPlugin ({
            template : 'public/index.html'
        })
    ],
    node: {
        fs: "empty"
    }
}
