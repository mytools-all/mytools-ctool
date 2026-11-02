# 离线依赖与许可

这些库只用于插件页面，许可证随每个使用它的独立包分发。资源随各插件独立维护。
不复制或分发 Rubick 参考插件的实现或图标。

| 库 | 版本 | 用途 | 上游 | 许可证 |
|---|---|---|---|---|
| marked | 18.1.2 | Markdown 解析 | https://github.com/markedjs/marked | MIT，marked.LICENSE |
| DOMPurify | 3.4.17 | Markdown HTML 清洗 | https://github.com/cure53/DOMPurify | Apache-2.0 OR MPL-2.0，purify.LICENSE |
| js-yaml | 5.5.0 | JSON / YAML 转换 | https://github.com/nodeca/js-yaml | MIT，yaml.LICENSE |
| js-md5 | 0.9.2 | MD5 与讯飞 WebAPI 签名 | https://github.com/emn178/js-md5 | MIT，md5.LICENSE |

各库版权与完整条款以对应 LICENSE 文件为准。依赖本地载入，不从 CDN 动态执行代码。

## 优先修复使用的编辑器组件

| 组件 | 版本 | 来源 | 许可证 |
|---|---|---|---|
| md-editor-v3 | 2.11.3 | https://github.com/imzbf/md-editor-v3 | MIT，md-editor.LICENSE |
| Vue | 3.5.42 | https://github.com/vuejs/core | MIT，vue.LICENSE |
| Cropper.js | 1.5.13 | https://github.com/fengyuanchen/cropperjs | MIT，cropper.LICENSE |
| screenfull | 5.2.0 | https://github.com/sindresorhus/screenfull | MIT，screenfull.LICENSE |
| highlight.js | 11.7.0 | https://github.com/highlightjs/highlight.js | BSD-3-Clause，highlight.LICENSE |

这些资源由 Markdown 包本地携带。`md-editor.mjs` 仅将 Vue 导入改为本地 `./vue.mjs`；图标脚本为该系列编辑器的默认图标资源。其余编辑器扩展通过本地实例注入，不在运行时向 CDN 请求脚本。
