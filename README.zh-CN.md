# pi-magpie-current-model

pi 扩展：显示 magpie **实际跑的模型**，而不是你选的那个组名。

pi 走 magpie 的 *group* 模型（比如「先用免费再付费」）时，pi 只知道组名——真正是谁接的这次请求是看不见的。magpie 会在 `X-Magpie-Model` 响应头里给出具体成员（如 `workbuddy-ai/step-5-preview`、`opencode-go/kimi-k3`）。本扩展读这个头，把真实模型放到你能看见的地方。

[English](README.md)

## 效果

footer 下多一行状态（`setStatus`）：

```
magpie: workbuddy-ai/step-5-preview  (group: Free first)   ← 组模型，成员揭晓
magpie: Kimi K3                                              ← 普通模型，不带组后缀
magpie: Free first                                           ← 还没请求过：只显示选中的
```

组名留在括号里，「你想怎么路由」和「实际谁答的」同时可见。若跑出来的模型就是选中的那个，就不重复加后缀。

`/magpie-model` 命令按需打印当前值（通知形式）：

```
magpie ran: workbuddy-ai/step-5-preview (selected group: Free first)
```

## 安装

作为一个 pi 包安装（git source）：

```bash
pi install git:github.com/zhaochunqi/pi-magpie-current-model
```

写入 `~/.pi/agent/settings.json` 的 `packages`；重开 pi 或 `/reload` 生效。升级：`pi update`。

临时试用（不写 settings）：

```bash
pi -e git:github.com/zhaochunqi/pi-magpie-current-model
```

## 实现

- `index.ts` —— pi 扩展胶水：`session_start` / `model_select` 清空旧值，`after_provider_response` 读 `X-Magpie-Model` 并重绘。
- `magpie-model.ts` —— 纯函数：响应头查找、组名、状态行与命令文本（无 pi、无 I/O，可直接单测）。
- `magpie-model.test.ts` —— 单测。

- 头查找**忽略大小写**：文档写的是 `X-Magpie-Model`，但服务端可以随便发；空值按「没有这个头」处理。
- 命令取的值不依赖 `ctx.ui`，所以在没有 UI 的 `print` / `json` 模式下也有意义。

## 开发

```bash
node --test magpie-model.test.ts
```

## 许可

[MIT](LICENSE)
