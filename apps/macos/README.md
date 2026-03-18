# macOS App

当前目录承载现有本地番茄钟应用源码。

## 文件

- `index.html`
- `styles.css`
- `app.js`

## 运行方式

直接打开当前目录下的 `index.html`：

```bash
cd apps/macos
open index.html
```

或使用本地静态服务器：

```bash
cd apps/macos
python3 -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 现有功能

- 预设 `30 mins`、`15 mins`、`5 mins`
- 自定义 `时 : 分`
- 同一时间只允许一个倒计时
- 切换其他倒计时时自动重置当前倒计时
- 支持开始、暂停、停止、重置
- 支持声音开关
- 倒计时结束时触发提示音与角色动画
