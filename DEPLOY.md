# 发布到 GitHub + Cloudflare Pages

这是普通 HTML / CSS / JavaScript 静态前端，地形计算在浏览器 Web Worker 内完成。网站运行不需要后端、数据库、API Key、ChatGPT 登录或任何托管平台专属 SDK。

## 本地开发

使用 Node.js 20 或更高版本：

```sh
npm ci
npm run dev
```

打开 http://localhost:5173 。修改源码后刷新页面即可。

```sh
npm run build
npm run preview
```

构建输出在 `dist/`；成品预览地址为 http://localhost:4173 。运行 `npm test` 检查物理、生成、安全路线、敌人和落石。项目没有第三方 npm 依赖，`npm ci` 只是遵循锁文件准备标准工作流。

## 上传 GitHub

1. 解压源码包，将其中的文件内容放在 GitHub 仓库根目录。
2. 确保仓库根目录直接包含 `package.json`、`index.html`、`src/`、`scripts/`，而不是再套一层目录。
3. 提交源码、`package-lock.json`、`.nvmrc`、`.gitignore` 和文档。`dist/` 是构建产物，不用提交。

源码包不含本机 Git 历史、托管平台标识或账号凭据。

## 连接 Cloudflare Pages

在 Cloudflare Pages 中连接该 GitHub 仓库，选择生产分支（通常为 `main`），使用以下配置：

| 项目 | 配置 |
| --- | --- |
| Framework preset / 框架预设 | `None` |
| Root directory / 根目录 | 留空（仓库根目录） |
| Build command / 构建命令 | `npm run build` |
| Build output directory / 输出目录 | `dist` |
| Node.js | 20 或更高；仓库已包含 `.nvmrc` |
| 环境变量、Functions、数据库绑定 | 无需配置 |

保存并部署。以后向生产分支推送源码，Pages 会重新构建部署。网站所有图片、声音和地形均由前端绘制 / 合成，不需要额外上传远程资源。

部署完成后，在该 Pages 项目的自定义域名设置中添加自己的域名，按页面提示完成 DNS 配置即可。无需修改代码中的域名。

如果仓库采用多项目结构，将 Root directory 改为包含本项目 `package.json` 的目录，例如 `mineral-descent`；输出目录仍填 `dist`。

官方文档：
- [Pages 构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [静态 HTML 部署](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)

## 目录

```text
index.html          页面入口
style.css           页面样式
src/engine.js       地形、流体、共享物理与 A* 验证
src/generator.js    地形生成 Worker
src/threats.js      黑暗与石钟乳
src/visuals.js      像素绘制
src/game.js         游戏循环、输入与界面
scripts/build.mjs   静态构建
scripts/dev.mjs     本地开发 / 成品预览服务器
verify*.cjs         可执行检查
```

运行时的存储仅用于本机浏览器的最深纪录，刷新可重新生成种子。生成线程需要 HTTP/HTTPS，因此不要直接双击 `index.html` 运行。
