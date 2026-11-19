<p align="center">
  <img src=".github/assets/banner.webp" alt="Plannotator" width="640" />
</p>

# Plannotator

简体中文 · [English](README.md)

Plannotator 让你在本地浏览器里审阅 AI 编程智能体的工作。智能体写好计划时，你可以直接在原文上圈选、评论，决定是否批准。审阅代码时，你可以在具体的改动行留下意见。通过插件或钩子打开的审阅会把反馈送回原会话，智能体就能据此继续工作。

[快速上手](#快速上手) · [安装与智能体接入](#安装与智能体接入) · [常用命令](#常用命令) · [收件箱](#收件箱) · [从源码运行](#从源码运行) · [官网](https://plannotator.ai/)

## 快速上手

**第一次使用，可以先给一份 Markdown 文件加批注。** 先按下文安装 CLI，然后在项目根目录运行下面的命令。[安装 CLI](#安装-cli)

```bash
plannotator annotate README.md
```

如果已经从源码构建了中文版，在仓库根目录用下面的命令打开这份中文指南。

```bash
./.local/plannotator annotate README.zh-CN.md
```

1. 在弹出的浏览器窗口里，拖选一段文字，点击**评论**。想对整份文档提意见，可以点击**整体评论**。
2. 写下意见并保存。侧栏会显示这条批注，你还可以继续批注其他段落。
3. 点击**发送反馈**结束审阅。从终端启动时，结果会输出到终端。从智能体会话启动时，反馈会回到发起审阅的会话。

当前源码中的计划审阅、Markdown 批注和代码审阅主界面支持简体中文，默认跟随浏览器语言。也可以打开 **选项 → 设置 → 常规 → 界面语言**，选择**简体中文**。英文界面的对应入口是 **Options → Settings → General → Interface language**。公开安装脚本下载的是 GitHub Releases 中的发行版。要体验当前源码里的改动，请使用本地构建。[本地构建步骤](#从源码运行)

| 你想做什么 | 在哪里操作 | 怎么开始 |
|---|---|---|
| 给文档提意见 | 终端 | `plannotator annotate README.md` |
| 审阅尚未提交的代码 | Git 仓库的终端 | `plannotator review --diff-type uncommitted` |
| 审阅智能体上一条回复 | 支持斜杠命令的智能体会话 | `/plannotator-last` |
| 在 Codex 中审阅代码 | Codex 会话 | `!plannotator review` 或 `$plannotator-review` |
| 审批实施计划 | 已接入计划审阅的智能体会话 | 让智能体制订计划，计划就绪时会自动打开审阅页 |
| 集中处理多个智能体的问题 | 终端 | `plannotator inbox --open` |

## 安装与智能体接入

### 安装 CLI

安装程序会下载 `plannotator`，识别本机已安装的智能体，并为支持的宿主配置钩子、技能和斜杠命令。Pi 可直接安装扩展，见下表。

**macOS、Linux 或 WSL**

```bash
curl -fsSL https://plannotator.ai/install.sh | bash
```

**Windows PowerShell**

```powershell
irm https://plannotator.ai/install.ps1 | iex
```

如果只需要独立 CLI，下面的命令会把二进制安装到 `~/.local/bin`，跳过智能体配置。也可以设置环境变量 `PLANNOTATOR_MINIMAL=1`。

```bash
curl -fsSL https://plannotator.ai/install.sh | bash -s -- --minimal
```

安装程序从 GitHub Releases 下载二进制。完整安装还可能访问 GitHub 以确定发行版本和获取智能体集成文件，并访问 npm 以获取 Pi 扩展、选装技能或托管的智能体终端运行时。指定 `--version` 后会直接下载该版本。[安装文档](https://docs.plannotator.ai/open-source/start/installation) · [隐私说明](https://plannotator.ai/privacy)

### 连接你使用的智能体

| 智能体 | 安装后的操作 |
|---|---|
| **Claude Code** | 在 Claude Code 中运行 `/plugin marketplace add backnotprop/plannotator`，然后运行 `/plugin install plannotator@plannotator` 并重启。之后让 Claude 在计划模式下制订计划即可。[Claude Code 说明](apps/hook/README.md) |
| **Codex** | 在 macOS、Linux 和 WSL 上，安装器会为已安装的 Codex 配置实验性的 `Stop` 钩子，用于在计划生成后打开审阅页。原生 Windows 安装器会打印手动配置步骤。附带 `$plannotator-review`、`$plannotator-annotate`、`$plannotator-last` 技能。[Codex 说明](apps/codex/README.md) |
| **Copilot CLI** | 运行 `/plugin marketplace add backnotprop/plannotator`，再运行 `/plugin install plannotator-copilot@plannotator` 并重启。用 `Shift+Tab` 进入计划模式。[Copilot CLI 说明](apps/copilot/README.md) |
| **Gemini CLI** | 安装器自动配置钩子、策略和斜杠命令。需要 Gemini CLI 0.36.0 或更高版本。[Gemini CLI 说明](apps/gemini/README.md) |
| **OpenCode** | 在 `opencode.json` 的 `plugin` 数组中加入 `"@plannotator/opencode@latest"`，然后重启 OpenCode。[OpenCode 说明](apps/opencode-plugin/README.md) |
| **Pi** | 直接运行 `pi install npm:@plannotator/pi-extension`。用 `pi --plan` 启动，或在会话里用 `/plannotator-plan-mode` 切换。[Pi 扩展说明](apps/pi-extension/README.md) |
| **DeepSeek Harness** | 在 DSH 的 Plugins 页面添加 `@plannotator/dsh`，或运行 `dsh plugin --profile <profile> add @plannotator/dsh`。`exit_plan_mode` 会打开计划审阅。插件提供的审阅和批注命令可在会话继续运行时打开。[DSH 说明](apps/dsh-plugin/README.md) |
| **Kiro CLI** | 安装器自动安装技能和一个示例智能体。运行 `kiro-cli chat --agent plannotator` 即可试用。[Kiro CLI 说明](apps/kiro-cli/README.md) |
| **Droid** | 运行 `droid plugin marketplace add https://github.com/backnotprop/plannotator`，再运行 `droid plugin install plannotator@plannotator`。当前通过命令发起审阅，尚未接入计划拦截。[Droid 说明](apps/droid-plugin/README.md) |
| **Amp** | 将插件文件复制到 `~/.config/amp/plugins/`，然后执行 `plugins: reload`。从命令面板启动审阅。[插件文件](apps/amp-plugin/plannotator.ts) · [Amp 说明](apps/amp-plugin/README.md) |
| **T3 Code** | 对于 T3 中的 Claude 线程，运行 `plannotator t3 --help`，按说明登录一次 T3，再添加带 `--t3` 的 MCP 配置。收件箱回复会成为原线程的新一轮消息。[T3 Code 说明](packages/t3-code/README.md) |

<details>
<summary>手动配置 Claude Code 钩子</summary>

如果你的环境使用手动配置，可以把下面的钩子合并到 `~/.claude/settings.json` 中已有的配置里。

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "plannotator",
            "timeout": 345600
          }
        ]
      }
    ]
  }
}
```

</details>

<details>
<summary>安装指定版本</summary>

将 `vX.Y.Z` 替换为目标发行版本的标签。

```bash
curl -fsSL https://plannotator.ai/install.sh | bash -s -- --version vX.Y.Z
```

```powershell
& ([scriptblock]::Create((irm https://plannotator.ai/install.ps1))) -Version vX.Y.Z
```

</details>

### 更新

重新运行安装程序即可更新二进制和斜杠命令。如果 `claude` 位于 `PATH`，安装器还会更新已安装的 Claude Code 插件。可用 `--skip-claude-plugin` 跳过。手动更新插件时，请依次运行以下两条命令，再重启 Claude Code。

```bash
claude plugin marketplace update plannotator
claude plugin update plannotator@plannotator
```

Pi 扩展用 `pi update --extensions` 更新。`pi update` 单独执行时只更新 Pi 本身。

## 常用命令

普通终端使用 `plannotator …`。多数智能体会话使用下列以 `/` 开头的命令，Codex 使用 `!plannotator …` 或 `$plannotator-*` 技能，Amp 从命令面板启动。

### 批注文档、网页和上一条回复

```text
/plannotator-annotate README.md                  # 批注本地 Markdown 文件
/plannotator-annotate src/                       # 浏览目录并选择文件批注
/plannotator-annotate https://docs.rs/…          # 把示例地址换成要批注的网页
/plannotator-annotate report.html --render-html  # 按原样渲染 HTML
/plannotator-last                                # 批注智能体的上一条回复
```

也可以审阅本机正在运行的网站。例如，前端开发服务器监听 `5173` 端口时，在终端运行下面的命令。Plannotator 会通过本地代理打开实际页面，批注期间仍可热更新。[HTML 可视化技能](https://github.com/plannotator/effective-html)

```bash
plannotator annotate http://localhost:5173
```

<img src=".github/assets/annotate.webp" alt="在文档原文旁添加批注" width="720" />

<img src=".github/assets/html.webp" alt="在渲染后的 HTML 页面上批注" width="720" />

需要示例文档时，可以将产品需求文档模板或填好的示例复制为 Markdown，再用 `annotate` 打开。[产品需求文档模板与示例](https://docs.plannotator.ai/templates/product-requirements-document)

### 代码审阅

在智能体会话中，可以审阅本地改动，也可以传入远程拉取请求的 URL。

```text
/plannotator-review                    # 打开当前仓库的代码审阅
/plannotator-review <github-pr-url>    # 审阅 GitHub Pull Request
/plannotator-review <gitlab-mr-url>    # 审阅 GitLab Merge Request
```

在终端也可以选择 GitButler 工作区，或直接打开一个统一差异格式的补丁文件。

```bash
plannotator review --gitbutler
plannotator review --patch-file reading.diff
```

审阅页左侧列出文件。点击某一行或拖选多行即可评论、提出代码修改建议，也可以暂存或取消暂存文件。通过智能体会话发起审阅时，发送反馈会将意见带回会话，批准则返回通过结果。支持 Git、GitButler、Jujutsu（`jj`）和 Perforce（`p4`）。GitButler 可以按整个工作区、单个分支栈或栈中的一层来审阅。[GitButler 工作流](https://docs.plannotator.ai/open-source/workflows/gitbutler)

<img src=".github/assets/review.webp" alt="代码审阅中的文件树和并排差异" width="720" />

**改动较大时**，点击 **指南（Guide）** 或按 `Cmd/Ctrl+Shift+G`。智能体会按核心改动、影响范围和配套修改组织章节。每章的说明旁边就是对应的真实差异，可以直接在上面批注。这些意见会随本次审阅一起发送。[审阅指南介绍](https://plannotator.ai/code-review#guided-review) · [代码审阅介绍](https://plannotator.ai/code-review)

<img src=".github/assets/guided-review.webp" alt="审阅指南将章节说明与可批注的代码差异并排显示" width="720" />

### 计划审阅

在支持计划钩子的宿主中，直接让智能体先给出实施计划。以 Claude Code 为例，它调用 `ExitPlanMode` 时会触发 `PermissionRequest` 钩子，本地服务器读取计划并打开审阅页。

- **可以开始实施**时，点击**批准**，智能体继续执行。
- **需要调整**时，在相关段落添加批注，点击**发送反馈**。智能体会收到结构化意见。再次审阅时，可以通过计划差异查看修改了哪些内容。

Claude Code 2.1.287 及以上版本支持异步审阅。Claude 可以先结束本轮，你对计划、代码或文档的审阅结果稍后以消息形式返回。设置 `PLANNOTATOR_CLAUDE_MOD=0` 可切回经典流程。[早期计划模式演示](https://www.youtube.com/watch?v=a_AT7cEN_9I)

### 会话与归档

```bash
plannotator sessions                   # 列出活跃的审阅会话
plannotator sessions --open 1          # 在浏览器重新打开列表中的第 1 个会话
plannotator archive                    # 以只读方式浏览已保存的计划审阅结果
```

## 收件箱

多个智能体并行工作时，可以把问题、待决事项、原型、文件和审阅指南发到同一个本地收件箱。你可以先处理需要决定的问题，稍后再批注文档。点击发送后，答复会回到提问的会话。

```bash
plannotator inbox          # 启动收件箱
plannotator inbox --open   # 在浏览器打开收件箱
```

Claude Code、Pi 和 OpenCode 通过 Plannotator 插件连接，回复会作为下一轮消息送达。其他智能体可以通过 `plannotator inbox mcp` 接入 MCP，使用 `plannotator inbox --help` 查看说明。收件箱也支持 Grok Bot、Muse、Hermes 和 OpenClaw 等个人助手。[收件箱文档](https://plannotator.ai/docs/reference/inbox/) · [视频演示](https://plannotator.ai/assets/inbox-film.mp4) · [收件箱介绍](https://plannotator.ai/inbox/)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/inbox-dark.webp" />
  <img src=".github/assets/inbox-light.webp" alt="桌面与手机上的收件箱，可以处理不同智能体的提问、选项和图表" width="720" />
</picture>

## 在终端里使用 Herdr Annotate

Herdr Annotate 可在终端中批注选中的文本、整份 Markdown 文档或智能体的回复，再将反馈作为下一条消息发给智能体。支持 Claude Code、Codex、Pi、Copilot CLI 和 Droid。终端和浏览器的审阅记录保存在同一个 Plannotator 数据目录。[Herdr Annotate](https://github.com/plannotator/herdr-annotate) · [Herdr](https://herdr.dev)

```bash
herdr plugin install plannotator/herdr-annotate
```

也可以通过 Homebrew 独立安装文档审阅工具 Plannotator TUI。[Plannotator TUI](https://github.com/plannotator/plannotator-tui)

```bash
brew install plannotator/tap/plannotator-tui
```

<img src=".github/assets/herdr-annotate.png" alt="用终端界面批注 Markdown 目录" width="600" />

## AI、分享与第三方集成

审阅时可以打开**问 AI（Ask AI）**，询问正在阅读的内容，也可以启动 AI 代码审阅，让审阅智能体直接在差异上发表评论。

要和同事一起审阅计划，可以复制分享链接，对方打开后添加批注，再由你导入反馈并发给智能体。小份内容直接保存在链接中，较大的内容会加密后上传，7 天后过期。持有完整链接的人都能读取分享内容。设置 `PLANNOTATOR_SHARE=disabled` 可关闭分享。[分享机制](https://docs.plannotator.ai/open-source/workflows/sharing)

| 集成 | 用法 |
|---|---|
| VS Code | 在编辑器标签页打开计划、查看行内差异，通过行号旁的边栏添加批注。[安装 VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=backnotprop.plannotator-webview) |
| Obsidian | 在设置中选择笔记库，自动保存已批准的计划，附带 YAML frontmatter、从标题生成的标签和反向链接。 |
| Bear | 将计划保存为笔记，带有嵌套标签和项目元数据。 |
| Notion | 在启动 Plannotator 的环境中设置 `NOTION_TOKEN`，在设置里选定已向集成共享的父页面。计划会保存为 Markdown 子页面。 |
| GitHub / GitLab | 将 PR 或 MR 链接传给 `/plannotator-review`，用文件树和完整差异视图逐行审阅。 |

需要团队共享工作区时，可登记 Plannotator Workspaces 的候补名单。[Workspaces](https://plannotator.ai/workspaces)

## 远程、SSH 和开发容器

Plannotator 会自动检测 SSH 会话，并在远程模式下使用固定端口 `19432`。在开发容器或 Docker 中，可以用下面的环境变量启用远程模式并指定端口。

```bash
export PLANNOTATOR_REMOTE=1
export PLANNOTATOR_PORT=9999
```

VS Code 开发容器通常会自动转发端口，可在 **Ports** 面板查看。直接使用 SSH 时，可在 `~/.ssh/config` 中配置端口转发。下面使用默认端口，如果显式设置了 `PLANNOTATOR_PORT`，请相应调整。

```sshconfig
Host your-server
    LocalForward 19432 localhost:19432
```

远程模式下，服务监听所有网络接口（`0.0.0.0`），无需登录。即使使用 SSH 隧道，能直接访问该端口的人也能操作审阅页面。请仅对受信任的网络开放该端口。

## 配置

每次钩子启动的本地服务可能使用不同端口。界面偏好保存在同一主机可跨端口读取的浏览器 Cookie 中。运行配置还可以通过环境变量或 `~/.plannotator/config.json` 设置。

| 环境变量 | 用途 |
|---|---|
| `PLANNOTATOR_REMOTE` | `1` / `true` 启用远程模式，`0` / `false` 启用本地模式。未设置时自动检测 SSH。 |
| `PLANNOTATOR_PORT` | 指定服务端口。本地默认随机，远程默认 `19432`。 |
| `PLANNOTATOR_BROWSER` | 指定打开计划所用的浏览器。`none`、`false`、`0`、`off`、`no`、`true`、`1` 或 `:` 均表示跳过自动打开浏览器，终端仍会打印会话 URL。 |
| `PLANNOTATOR_AI` | `disabled` 关闭问 AI、审阅智能体和审阅指南。批注页中的智能体终端单独控制。 |
| `PLANNOTATOR_SHARE` | `disabled` 关闭 URL 分享。 |
| `PLANNOTATOR_SHARE_URL` | 自托管分享门户的基础 URL。 |
| `PLANNOTATOR_PASTE_URL` | 分享内容存储服务的 API 基础 URL。 |
| `PLANNOTATOR_ORIGIN` | 手动指定智能体来源，可选 `claude-code`、`amp`、`droid`、`opencode`、`codex`、`copilot-cli`、`gemini-cli`、`kiro-cli`、`pi`。 |
| `PLANNOTATOR_JINA` | `0` / `false` 关闭网页批注使用的 Jina Reader。 |
| `JINA_API_KEY` | Jina Reader 的 API 密钥，可提高请求限额。 |
| `PLANNOTATOR_DATA_DIR` | 指定计划、历史、草稿和 `config.json` 的基础目录。运行 `plannotator data-dir` 可查看实际路径。 |

默认数据目录是 `~/.plannotator`。如果它不存在，而 `XDG_DATA_HOME` 是绝对路径，则使用 `$XDG_DATA_HOME/plannotator`。如果前者没有 Plannotator 数据、后者已有数据，也会采用后者。例如，可以将数据存放到以下目录。

```bash
export PLANNOTATOR_DATA_DIR=~/.local/share/plannotator
```

### Vim 键盘操作

在计划和文档批注页，进入 **设置 → Vim** 启用默认关闭的 **Vim controls**。页面就绪且焦点空闲时，文档会自动获得焦点。在工具栏操作后，按 `Escape` 可返回文档。

| 按键 | 作用 |
|---|---|
| `j` / `k` | 移至下一个 / 上一个内容块。进入更细层级后，在同级的行、单元格或行内目标之间移动。 |
| `l` / `h` | 进入下一层 / 返回上一层。进入最深层后可选择文本。 |
| `v` / `V` | 按字符选择 / 选择整块。 |
| `Space` | 打开批注工具栏。 |
| `c`、`d`、`m`、`t` | 分别选择评论、划删、标记和标签。 |
| `?` | 打开当前上下文的快捷键说明。 |

键盘导航与鼠标点选使用相同的文档定位方式。输入框、对话框、编辑器、`Tab` 键和鼠标操作保留原有行为。还可以启用 **Vim HUD** 显示定位标记，或单独隐藏右下角的 **Key panel**。该面板展示最近生效的按键、当前位置和命令含义，输入评论时的文字不会被记录到按键面板。[Vim 操作说明](docs/vim-controls.md)

## 从源码运行

在仓库根目录安装依赖。如果要编译独立的 CLI，请使用 Bun 1.4.4 或更高版本。

```bash
bun install
```

开发时，按需要启动对应的界面。

| 命令 | 作用 |
|---|---|
| `bun run dev:hook` | 启动计划审阅界面的开发服务 |
| `bun run dev:review` | 启动代码审阅界面的开发服务 |
| `bun run dev:marketing` | 启动官网开发服务 |
| `bun run dev:vscode` | 监听并重新构建 VS Code 扩展 |

要构建主要组件，可以运行 `bun run build`。只构建 DeepSeek Harness 插件或 VS Code 扩展时，分别运行 `bun run build:dsh` 或 `bun run build:vscode`。修改共享界面后，请先构建代码审阅页，再构建钩子和 OpenCode 插件，后两者会打包前一步生成的 HTML。

```bash
bun run --cwd apps/review build && bun run build:hook && bun run build:opencode
```

完成上述构建后，在 macOS、Linux 或 WSL 中运行以下命令，将开发版 CLI 生成到仓库的 `.local/` 目录。

```bash
mkdir -p .local
bun scripts/require-bun.ts && \
  bun build apps/hook/server/index.ts --compile --no-compile-autoload-bunfig \
  --define '__CLI_VERSION__="0.0.0-dev"' --outfile .local/plannotator
```

用刚构建的程序打开本文，或在 Git 仓库中审阅改动。

```bash
./.local/plannotator annotate README.zh-CN.md
./.local/plannotator review
```

测试本地 Claude Code 插件时，将开发版 CLI 的目录加入本次启动的 `PATH`，再让 Claude 在计划模式下制订计划。

```bash
PATH="$PWD/.local:$PATH" claude --plugin-dir ./apps/hook
```

## 卸载

运行 `plannotator uninstall` 会移除可识别的已安装组件，并保留本地计划、历史、草稿、指南和设置。可以先预览会移除哪些内容。

```bash
plannotator uninstall --dry-run
```

如果还想永久删除保存在本机的 Plannotator 数据，运行 `plannotator uninstall --purge`，并在提示时输入 `purge`。删除后无法从 Plannotator 服务器恢复这些数据。自动化脚本通过 `--yes` 或 `-y` 确认非交互卸载。如果只安装了独立的 Pi 扩展，运行 `pi remove npm:@plannotator/pi-extension` 即可。

<details>
<summary>卸载范围和遇到问题时的处理方式</summary>

卸载器可处理 macOS、Linux、WSL 和 Windows 上常见位置的 CLI、托管的 `sem` 组件和智能体终端运行时，以及安装器写入的技能、命令、钩子、策略和缓存。它会通过各宿主的 CLI 清理检测到的 Claude Code、Copilot CLI、Droid、Pi 和 VS Code 集成。修改共享配置时会保留其它条目和原有 JSON 格式。

自定义文件、单独安装的可选技能、项目级集成以及保存在外部位置的计划会保留。手动添加的 `plannotator-inbox` 条目或项目级插件会列出对应的移除方法。如果宿主配置无法读取、插件管理器不可用，或手动配置的钩子仍依赖 Plannotator，命令会保留 CLI 并给出具体的清理步骤。处理后可以重新运行卸载命令。在 Windows 上，若恢复 PATH 失败，可以用提示中的 CLI 完整路径重试。

彻底清除数据前，卸载器会重新核对数据目录及其位置。文件系统根目录、用户主目录、共享临时目录、符号链接和普通文件受保护。如果专用数据目录通过符号链接访问，可将 `PLANNOTATOR_DATA_DIR` 设为链接解析后的实际目录再重试。

</details>

## 安全与发行验证

每个发行版二进制文件都有对应的 SHA-256 校验文件。从 v0.17.2 起，发行版还提供 SLSA 构建来源证明。需要在安装时验证来源，可以运行以下命令。[安装与版本验证文档](https://docs.plannotator.ai/open-source/start/installation#pin-or-verify-a-release)

```bash
curl -fsSL https://plannotator.ai/install.sh | bash -s -- --verify-attestation
```

开启验证需要安装 GitHub CLI（`gh`）。安装程序从 GitHub 公开 API 获取证明包，使用 PATH 中的 Node.js、Python 3 或 jq 提取，再由 `gh attestation verify --bundle` 验证，通常无需登录。必要时会尝试使用已认证的 `gh` 获取证明。常规安装可直接运行安装脚本。若希望今后的安装都验证构建来源，可在 `~/.plannotator/config.json` 中设置以下选项。

```json
{ "verifyAttestation": true }
```

<details>
<summary>手动验证 Linux x64 发行版及其软件物料清单（SBOM）</summary>

发行流程使用 Syft 生成 CycloneDX JSON 格式的 SBOM，列出整个仓库锁定的构建输入及依赖。由于 Bun 独立可执行文件内嵌的 JavaScript 包元数据对 Syft 不可见，清单的范围是整次发行。流程使用最新的 Grype 数据库扫描，在发布前检查结果，并为二进制文件和 npm 压缩包生成 GitHub/Sigstore SBOM 证明。

将下例的 `vX.Y.Z` 替换为带有 SBOM 的实际发行标签，即可下载文件、核对校验和，并验证构建来源与清单。

```bash
tag=vX.Y.Z
version="${tag#v}"
mkdir -p /tmp/plannotator-release-verify
gh release download "$tag" --repo backnotprop/plannotator \
  --pattern 'plannotator-linux-x64*' \
  --pattern "plannotator-${version}-release-sbom.cdx.json*" \
  --dir /tmp/plannotator-release-verify

(cd /tmp/plannotator-release-verify && sha256sum --check plannotator-linux-x64.sha256)
(cd /tmp/plannotator-release-verify && sha256sum --check "plannotator-${version}-release-sbom.cdx.json.sha256")

gh attestation verify /tmp/plannotator-release-verify/plannotator-linux-x64 \
  --repo backnotprop/plannotator --source-ref "refs/tags/$tag" \
  --signer-workflow backnotprop/plannotator/.github/workflows/release.yml \
  --predicate-type https://slsa.dev/provenance/v1

gh attestation verify /tmp/plannotator-release-verify/plannotator-linux-x64 \
  --repo backnotprop/plannotator --source-ref "refs/tags/$tag" \
  --signer-workflow backnotprop/plannotator/.github/workflows/release.yml \
  --predicate-type https://cyclonedx.org/bom
```

两项证明对应同一个文件摘要。SLSA 证明记录构建者、源码和工作流，CycloneDX 证明描述该次发行的依赖清单。发行流程还用 `jq -S` 对下载的 SBOM 和证明中的清单排序并比对。发布检查会拒绝扫描器已忽略的匹配项，并在评估 CISA 已知遭利用漏洞（KEV）和可修复的严重漏洞时，把适用性未知的依赖按运行时依赖处理。工作流保留 Grype 配置、完整的 JSON 结果、数据库状态和判定记录。[SLSA](https://slsa.dev/)

</details>

## 许可证

版权所有 © 2025–2026 backnotprop。

你可以选择按 Apache 2.0 或 MIT 许可证使用本项目。除非贡献者明确声明其他条款，贡献内容也采用相同的双重许可。[Apache 2.0 许可证](LICENSE-APACHE) · [MIT 许可证](LICENSE-MIT)
