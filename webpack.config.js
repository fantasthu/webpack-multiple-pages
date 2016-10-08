var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var pkg = require("./package.json");
var glog = require("glob");
var dist = glog.sync("./dist");
console.log("dist",dist);
function getEntries(src) {
    var arr = [];
    var entry = {};
    var files = glog.sync(src);
    files.forEach(function (item) {
        var splits = item.split("\/");
        var name = splits[splits.length - 1];
        var realname = name.split("\.")[0];
        arr.push(realname);
        entry[realname] = [item];
    });
    return {
        arr: arr,
        entry: entry
    };
}
function getHtmlWebpackPlugins() {
    var res = [];
    var entries = getEntries("./src/js/**/*.js").entry;
    Object.keys(entries).forEach(function (item) {
        var html = new HtmlWebpackPlugin({
            inject: true,
            chunks: ['vendors', item],
            filename: 'views/' + item + ".html",
            template: 'src/views/' + item + ".html",
        });
        res.push(html);
    });
    return res;
}
var Entry = getEntries("./src/js/**/*.js");
var htmls = getHtmlWebpackPlugins();
var webpackConfig = {
    entry: Entry.entry,
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicpath: "./dist/",
        filename: 'js/[hash:8][name].js'
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },
            {
                test: /\.less$/,
                //配置less的抽取器、加载器。中间!有必要解释一下,
                //根据从右到左的顺序依次调用less、css加载器，前一个的输出是后一个的输入
                //你也可以开发自己的loader哟。有关loader的写法可自行谷歌之。
                loader: ExtractTextPlugin.extract('css!less')
            },
            {
                //文件加载器，处理文件静态资源
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=./fonts/[name].[ext]'
            },
            {
                //图片加载器，雷同file-loader，更适合图片，可以将较小的图片转成base64，减少http请求
                //如下配置，将小于8192byte的图片转成base64码
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=8192&name=./img/[hash].[ext]'
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('css/[contenthash:8].[name].css', {}),
        new CommonsChunkPlugin({
            name: 'vendors',
            chunks: [Entry.arr],
            // minChunks是指一个文件至少被require几次才会被放到CommonChunk里，如果minChunks等于2，说明一个文件至少被require两次才能放在CommonChunk里
            minChunks: 2 // 提取所有chunks共同依赖的模块
        }),
    ]
};
htmls.forEach(function (item) {
    webpackConfig.plugins.push(item);
})
module.exports = webpackConfig;