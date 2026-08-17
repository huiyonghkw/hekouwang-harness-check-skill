---
name: hekouwang-harness-check-skill
description: 当用户要求检查、体检、回归、验收、解释或诊断会勇禾口王内容工作流 Harness，或维护、移植、打包、开源这个 Harness 检查器 Skill 时使用。统一调用仓库现有的 verify.sh、harness-check、Runtime Governance、Hook、Task Contract、Safety Gate、Episode、可观测性和失败台账检查，并分别报告本地、暂存区、CI 自动化结果与真实宿主烟测边界。
---

# 会勇禾口王 Harness 检查器

## 目标

把 Harness 检查变成可重复、可审计的交付动作。检查逻辑以仓库 `.harness/` 为唯一真源；本 Skill 负责选择入口、完整执行、解释结果和暴露未覆盖边界，不复制或改写检查规则。

## 入口选择

先定位仓库根目录：必须能找到 `.harness/scripts/verify.sh`。所有命令从仓库根目录运行。

| 用户目的 | 入口 |
| --- | --- |
| 检查当前本地工作区 | `bash .harness/scripts/verify.sh --working-tree` |
| 检查准备提交的治理改动 | `bash .harness/scripts/verify.sh --staged` |
| 模拟 CI、去除本机 Skill/Memory 依赖 | `bash .harness/scripts/verify.sh --ci` |
| 只诊断结构、链接和治理契约 | `bash .harness/scripts/harness-check.sh --local` 或 `--ci` |
| 生成可复核分数与网页数据 | `python3 harness_score.py <repo> --format json` |

不要默认只跑 `harness-check.sh` 就宣称 Harness 完成；完整验收应优先使用 `verify.sh`。

## 执行规则

1. 直接运行命令并保留退出码。不要用 `| head`、`|| true` 或吞掉 stderr 的方式判断成功。
2. 需要保存长日志时写入临时目录，完整读取失败段；不要把临时日志当成任务证据提交。
3. 先报告自动化结果，再报告人工检查；两者不能合并成一个“全部通过”。
4. 从实际输出读取检查数量。基础闭环曾输出本地 `722`、CI `165` 项；纳入本 Skill 的组件和路由断言后当前为本地 `728`、CI `171` 项。这些都不是永久硬编码的总分；数量变化时如实记录，不自行补算或夸大。
5. `⚠️` 是警告，不等于 `✅`；只要任一应通过检查返回非零，就判定自动检查失败。
6. 检查失败时先指出失败命令、失败项目和可复现路径。只有用户明确要求修复时才改文件；改前遵守 `AGENTS.md` 的范围说明和确认规则。
7. 不使用 `--no-verify` 绕过 Hook，不为让检查通过而修改计数、删除反例、关闭治理项或把宿主烟测写成自动化证据。

## Scorecard 规则

需要量化比较或为网页/GIF 准备数据时，运行独立的 `harness_score.py`。它扫描目标仓库的 12 个治理维度，并输出 `score.value`、`confidence`、成熟度、硬上限、逐维度证据、宿主矩阵和真实执行记录。

```bash
python3 harness_score.py /path/to/harness \
  --format json --output ./harness-scorecard.json \
  --mode working-tree --mode ci \
  --profile content-agent
```

评分规则：

- 分数是加权成熟度，不是 Runtime Governance 或测试项数量；
- 文档关键词和目录名称只能作为降权线索，不能替代可执行检查、契约、正反例或退出码；
- 缺少验证入口、安全执行、CI 可复现性、反例回归或完成证据时触发硬上限；
- 宿主配置存在只记为 configured，未看到真实宿主触发证据就保持 `unknown`；
- 静态扫描、目标仓库执行结果、真实宿主烟测和内容人工验收必须分别报告；
- 领域规则通过 `--profile` 叠加，通用 100 分与领域分分别展示；领域分会保留 `evidenceKind` 和独立置信度，文档声明不能冒充运行证据；当前内置 `content-agent`，自定义项目应新增 JSON Profile，而不是修改通用评分器；
- JSON 字段和评分权重分别由 `references/scorecard-schema.json`、`references/score-rubric.json` 定义。

## 结果报告格式

至少输出以下五部分：

1. **模式与范围**：`working-tree`、`staged` 或 `ci`，以及检查到的仓库/提交。
2. **自动化结论**：命令退出状态；列出通过、失败和警告。若输出包含 Runtime Governance 数量，注明是本地还是 CI。
3. **失败定位**：保留原始检查标签和复现命令，不把“工具没输出”解释成通过。
4. **人工/宿主边界**：说明是否实际触发了 Claude Code、Cursor、CodeBuddy、Codex 的 Hook；是否检查了真实平台视觉、浏览器或 MCP 外部副作用。
5. **下一步**：修复、补宿主烟测、记录失败台账，或明确“自动化通过但不能交付”的原因。

## 不能替代的人工检查

语义 Hook 配置校验和 fixture 正反例只能证明配置可解析、规则可归一化、失败路径能被拦截，不能证明真实宿主一定触发。以下情况必须单独标记为“宿主烟测待补”：

- 在四个真实 Agent 宿主中触发一次允许、询问和阻断路径；
- 在真实编辑器、浏览器、公众号/头条/小红书宿主中检查最终呈现；
- 检查文章事实、来源、自然度和视觉质量；
- 检查 MCP 工具的真实外部副作用和人工确认链路。

## 失败后的最小动作

- `verify.sh` 失败：按输出先运行对应的单项测试，例如 `bash .harness/tests/test-hook-config.sh`。
- 适配链接失败：先查看 `bash .harness/scripts/sync-agent-adapters.sh --check`；未经用户明确要求，不自动使用 `--fix`。
- Runtime Governance 漂移：检查 `.harness/contracts/`、`AGENTS.md`、`.agents/skills/` 和 Memory 真源，不直接改测试让它变绿。
- 内容任务预检：同时加载 `hekouwang-precheck`，并把自动检查和人工视觉检查分开报告。

详细命令、检查层级和历史基线/当前数量口径见 [`references/check-matrix.md`](references/check-matrix.md)。面向维护者的开源说明和流程图见 [`README.md`](README.md)。
