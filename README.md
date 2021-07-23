# test-vue-ssr

## 
``` 打包
通过执行npm run build:win
进行打包，打包的命令在package.json
打包后dist文件内会有
模板文件 index.template.html
和配置文件
vue-ssr-client-manifest.json
vue-ssr-server-bundle.json
index.html 最好删除

```

### 启动
```

进入service文件，通过 node index.js 命令来启动

```

### 一些配置
```
## vue.config.js-----------------------------
{
    publicPath: '/',
	outputDir: 'dist', //打包时生成的生产环境构建文件的目录
	assetsDir: 'staticNte', // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录
	lintOnSave: false,
	
	//上面是一些常规的配置不必理会
	
	css: {
		extract: false
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
}

## entry-client.js entry-server.js-----------------------------
放置在src文件下

## index.template.html

模板文件可以放置在public文件内，打包时一起带过去 可以在service/index.js 中配置 ../dist/index.template.html
个人感觉比较方便

## 修改后的store(Vuex)文件-----------------------------

需要将 Vuex.Store 作为函数返回出去

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createStore() {
	return new Vuex.Store({
		state: { 
		
		},
		mutations: {

		},
		actions: {

		}
	});
}

## import Vue from 'vue' -----------------------------

需要将 VueRouter 作为函数返回出去
必须是history模式

import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
	{
		path:'/',
		redirect:'/home'
	},
	{
		path:'/home',
		component:() => import('@/views/Home')
	},{
		path:'/about',
		component:() => import('@/views/About')
	}
]

export function createRouter() {
	return new VueRouter({
		mode: 'history', //一定要是history模式
		// base: process.env.BASE_URL,
		routes: routes
	})
}


## main.js-----------------------------
引入router和vuex后挂载就行

import Vue from 'vue'
import App from './App.vue'
import {
	createRouter
} from '@/router'
import {
	createStore
} from "@/store";

Vue.config.productionTip = false

export function createApp() {
	const router = createRouter();
	const store = createStore() // +
	const app = new Vue({
		router,
		store, // +
		render: h => h(App)
	});
	return {
		app,
		router,
		store
	};
}

## service/index.js

 宿主模板文件../dist/index.template.html根据自己放置的路径来配置
 
 中间件处理静态文件请求  打包后叫啥就填啥

// nodejs服务器
const express = require("express");
const Vue = require("vue");
const fs = require("fs");

// 创建express实例和vue实例
const app = express();
// 创建渲染器
const { createBundleRenderer } = require("vue-server-renderer");
const serverBundle = require("../dist/vue-ssr-server-bundle.json");
const clientManifest = require("../dist/vue-ssr-client-manifest.json");
const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: fs.readFileSync("../dist/index.template.html", "utf-8"), // 宿主模板文件
  clientManifest
});

// 中间件处理静态文件请求
app.use(express.static("../dist", { index: false })); // 防止访问index.html不走服务端

// 路由处理交给vue
app.get("*", async (req, res) => {
  try {
    const context = {
      url: req.url,
      title: "ssr test"
    };

    const html = await renderer.renderToString(context);
    res.send(html);
  } catch (error) {
    res.status(500).send("服务器内部错误");
  }
});

app.listen(3000, () => {
  console.log("渲染服务器启动成功", "http://localhost:3000/");
});



```
### 事件失效？
```
必须存在一个 id app 作为根元素不然事件全局失效  个人问题可以参考
可以放置在app.vue文件中作为根元素

```
### service中的server.js
```
不必理会，只是测试的文件，可以删除
```

### 说明
```
基本也就这些了吧，我自己也不太懂原理，只能理解大概意思  能用就行，后续再补充

```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).\
