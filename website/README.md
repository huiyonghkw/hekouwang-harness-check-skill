# hekouwang Harness Doctor 产品页

这是 `hekouwang-harness-check-skill` 的 GitHub Pages 静态产品介绍页。

## 本地预览

在仓库根目录运行：

```bash
python3 -m http.server 4173 -d website
```

然后打开 <http://127.0.0.1:4173/?lang=zh>。

完整中文 Guide：<http://127.0.0.1:4173/guide/index.html?lang=zh>。产品首页负责定位、动态 GIF、交互 Scorecard 和证据展示；Guide 页负责从“什么是 Harness”到 Hook、Evaluator、失败台账、独立验收和 CLI 的连续阅读。

页面不依赖构建工具、CDN 或外部字体。`data/demo-scorecard.json` 是网页交互评分器的演示输入，字段与评分器 JSON 输出协议保持一致；演示数据来自 `hekouwang-content-agent` 的一次真实扫描，展示时已收敛为仓库相对路径。

字体基线是本地 Google Sans Flex / Google Sans Text / Google Sans / Noto Sans SC，字体说明见 [`assets/fonts/README.md`](assets/fonts/README.md)。

页面的“从 0 到高级”学习路线对应仓库中的 [`docs/harness-from-zero-to-advanced.zh-CN.md`](../docs/harness-from-zero-to-advanced.zh-CN.md)。它将用户提供的 36 页 Harness 入门教程整理为可执行的学习路径，并补充独立验收、证据契约、跨状态和真实宿主边界。

`assets/harness-doctor-run.gif` 是一次真实的 Harness Doctor 终端运行录屏，页面使用懒加载展示，服务于产品演示；它不是质量证明本身，完整证据仍以 JSON Scorecard 和目标仓库的真实退出码为准。

## 页面边界

- 页面展示的是独立验收层，不把 Harness Runtime、模型能力和质量分数混为一谈；
- 页面把 `working-tree`、`ci`、`content-agent` Profile 和宿主 `unknown` 状态分开呈现；
- 页面中的示例分数不是运行时质量保证，也不替代真实宿主烟测和人工验收；
- 页面中的 GIF 是运行过程证据的可视化入口，不把录屏画面本身当成通过证明；
- 修改文案或视觉时，保持 JSON 下载、命令复制、语言切换和无 JavaScript 降级可读。

GitHub Pages 由 [`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) 发布。
