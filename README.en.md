# hekouwang-harness-check-skill

**Simplified Chinese** · [中文 README](README.md)

> An evidence-driven Agent Skill for checking a Harness without confusing “the scripts ran” with “the task is complete.”

This is the standalone source repository for the Skill. It selects the right verification mode, calls the target repository’s existing Harness entry points, preserves exit codes and evidence, and reports automated checks separately from real-host smoke tests and human review.

## What it checks

- Working-tree, staged, and CI verification modes;
- Hooks, Safety Gates, Task Contracts, Episodes, observability, and failure ledgers;
- Positive and negative fixtures, drift detection, adapter checks, and documentation links;
- Explicit boundaries for Claude Code, Cursor, CodeBuddy, Codex, browsers, MCP side effects, and visual/content review.

The Skill is an orchestration layer. It does not copy or replace the target repository’s `.harness/` scripts and contracts. The first reference implementation is [hekouwang-content-agent](https://github.com/huiyonghkw/hekouwang-content-agent).

## Install into a Harness repository

From the target repository root:

```bash
git clone https://github.com/huiyonghkw/hekouwang-harness-check-skill.git \
  .agents/skills/hekouwang-harness-check-skill
```

The target repository must provide at least:

```text
.harness/scripts/verify.sh
.harness/scripts/harness-check.sh
.harness/tests/
```

The host project is responsible for creating its own Claude Code, Cursor, CodeBuddy, and Codex adapters. If it has a synchronization script, validate the links with:

```bash
bash .harness/scripts/sync-agent-adapters.sh --check
```

## Direct verification

```bash
bash .harness/scripts/verify.sh --working-tree
bash .harness/scripts/verify.sh --staged
bash .harness/scripts/verify.sh --ci
```

Use the modes precisely:

| Mode | Evidence | Allowed conclusion |
| --- | --- | --- |
| `working-tree` | Current machine, local Skill and Memory | Local automated checks passed or failed |
| `staged` | The staged change set | This staged change set passed or failed |
| `ci` | Repository fixtures and reproducible checks | CI automation passed or failed |

None of these modes proves that a real Agent host, editor, browser, platform publisher, or MCP side effect behaved correctly. Report those as separate smoke-test or human-review evidence.

## Reporting contract

Every report should include:

1. Mode, repository, and commit;
2. Exact command and exit status;
3. Passed checks, failures, and warnings, retaining original labels;
4. Runtime Governance count as observed in the log, never as a hard-coded score;
5. Real-host smoke-test status and human-review boundaries;
6. A reproducible next step for every failure.

Do not use `| head`, `|| true`, `--no-verify`, or fixed counts to manufacture a pass. A warning is not a pass, and a headless fixture is not a real-host smoke test.

## Repository layout

```text
SKILL.md                         Agent instructions and result protocol
agents/openai.yaml               OpenAI/Codex discovery metadata
references/check-matrix.md       Scope and count terminology
assets/harness-check-flow.svg    Portable workflow diagram
README.md                        Chinese documentation
README.en.md                     English documentation
```

## Development

Changes to this repository should keep the Skill portable:

1. Keep project-specific facts in the target Harness, not in this repository;
2. Add a positive and a negative example when behavior changes;
3. Update `SKILL.md`, the check matrix, documentation, and the diagram when the protocol changes;
4. Run the package validation workflow and the full checks in a reference Harness;
5. Document what automation proves and what still needs a real host or human.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
