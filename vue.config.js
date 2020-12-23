// vue.config.js

const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");
const nodeExternals = require("webpack-node-externals");
const merge = require("lodash.merge");
const TARGET_NODE = process.env.WEBPACK_TARGET === "node";
const target = TARGET_NODE ? "server" : "client";


module.exports = {
	publicPath: '/',
	outputDir: 'dist', //打包时生成的生产环境构建文件的目录
	assetsDir: 'staticNte', // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
	lintOnSave: false,
	css: {
		extract: false
	},
	devServer: {
		open: true, //是否自动弹出浏览器页面 
		host: '0.0.0.0',
		disableHostCheck: true, //解决域名访问本地运行地址时出现Invalid Host header的问题 
		port: 8054, //端口
		proxy: {
			'/api': {
				ws: true,
				changeOrigin: true, // 表示是否跨域
				// target: 'http://192.168.1.4:8484', // 本地 
				target: 'http://www.sensorservice.com', //服务器 
				pathRewrite: {
					'^/api': '' //重写接口
				}
			}
		}
	},
	configureWebpack: () => ({
		// 将 entry 指向应用程序的 server / client 文件
		entry: `./src/entry-${target}.js`,
		// 对 bundle renderer 提供 source map 支持
		devtool: 'source-map',
		target: TARGET_NODE ? "node" : "web",
		node: TARGET_NODE ? undefined : false,
		output: {
			libraryTarget: TARGET_NODE ? "commonjs2" : undefined
		},
		// https://webpack.js.org/configuration/externals/#function
		// https://github.com/liady/webpack-node-externals
		// 外置化应用程序依赖模块。可以使服务器构建速度更快，
		// 并生成较小的 bundle 文件。
		externals: TARGET_NODE ?
			nodeExternals({
				// 不要外置化 webpack 需要处理的依赖模块。
				// 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
				// 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
				whitelist: [/\.css$/,/demo-lib/],
				allowlist: /\.css$/
			}) :
			undefined,
		optimization: {
			splitChunks: TARGET_NODE ? false : undefined
		},
		plugins: [TARGET_NODE ? new VueSSRServerPlugin() : new VueSSRClientPlugin()]
	}),
	chainWebpack: config => {
		config.module
			.rule("vue")
			.use("vue-loader")
			.tap(options => {
				merge(options, {
					optimizeSSR: false
				});
			});
	}
};
