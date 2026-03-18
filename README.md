# pomodora

同一个仓库同时承载网页版番茄钟和 macOS 版番茄钟，按目录区分，而不是按长期分支区分。

## Repo 结构

```text
apps/
  macos/   当前可运行的本地番茄钟应用
  web/     预留给后续网页版实现
```

## 当前状态

- `apps/macos/` 已承载现有番茄钟功能
- `apps/web/` 已预留目录和说明文件
- 现有功能保持不变

## 运行方式

### macOS 版

进入 `apps/macos/` 后运行：

```bash
open index.html
```

或启动一个本地静态服务器：

```bash
cd apps/macos
python3 -m http.server 4173
```

然后访问 `http://localhost:4173`。

### Web 版

`apps/web/` 当前仅作为目录占位，后续新增网页版时在该目录落地。
