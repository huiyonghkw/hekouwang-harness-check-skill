# Changelog

本文件记录独立 `hekouwang-harness-check-skill` Skill 的发布变化。

## Unreleased

- 新增标准库实现的 `Harness Scorecard` CLI，提供 12 维加权分、硬上限、置信度、成熟度、宿主矩阵、退出码和 JSON/Markdown 输出；
- 新增评分规则与 JSON Schema，输出可直接供后续网页/GIF 消费；
- 新增强/弱仓库 fixture 回归，验证 README 关键词不能绕过缺失门禁；
- 新增可插拔领域 Profile 机制与首个 `content-agent` Profile，把发布状态、来源、渠道、生成物、视觉和外部副作用从通用分中分离；
- 增加 DeepSeek Harness 对标定位，明确运行时与独立验收层的产品边界；
- 新增 GIF/网页演示分镜与离线 JSON 数据消费说明；
- 修正执行日志的检查数量解析、超时/启动失败结构化和失败标签误报。

## 0.1.0 — 2026-08-17

- 首次独立发布证据驱动 Harness 检查器 Skill；
- 提供 `working-tree`、`staged`、`ci` 三种验证模式的编排与报告协议；
- 覆盖 Hook、Safety Gate、Task Contract、Episode、可观测性、失败台账和真实宿主边界；
- 发布中文 README、英文 README、检查矩阵和 SVG 流程图；
- 采用 MIT License。
