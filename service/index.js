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
// app.use(express.static("../dist/client"));

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
