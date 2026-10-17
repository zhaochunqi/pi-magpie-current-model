# pi-magpie-current-model

A [pi](https://pi.dev) extension that shows the model magpie **actually ran**, instead of the group name you picked.

When pi talks to magpie through a *group* model (e.g. "先用免费再付费"), pi only ever knows the group name — whichever member served the request is invisible. magpie reports it in the `X-Magpie-Model` response header (e.g. `workbuddy-ai/step-5-preview`, `opencode-go/kimi-k3`). This extension reads that header and puts the real model where you can see it.

[中文说明](README.zh-CN.md)

## What it looks like

A status line appears below the footer (`setStatus`):

```
magpie: workbuddy-ai/step-5-preview  (group: Free first)   ← group model, member revealed
magpie: Kimi K3                                              ← plain model, no group suffix
magpie: Free first                                           ← before any request: just the selection
```

The group stays readable in brackets, so both the routing you asked for and the model that answered are visible at once. When the served model turns out to be the selected one, the suffix is dropped instead of repeating itself.

`/magpie-model` prints the current value on demand as a notification:

```
magpie ran: workbuddy-ai/step-5-preview (selected group: Free first)
```

## Install

Install as a pi package (git source):

```bash
pi install git:github.com/zhaochunqi/pi-magpie-current-model
```

This writes a `packages` entry to `~/.pi/agent/settings.json`. Restart pi or run `/reload` to pick it up. Update later with `pi update`.

Try it for a single session without touching settings:

```bash
pi -e git:github.com/zhaochunqi/pi-magpie-current-model
```

## How it works

- `index.ts` — the pi extension glue: `session_start` / `model_select` reset the value, `after_provider_response` reads `X-Magpie-Model` and redraws.
- `magpie-model.ts` — pure functions: header lookup, group label, status-line and command text (no pi, no I/O, directly unit-testable).
- `magpie-model.test.ts` — unit tests.

- Header lookup is **case-insensitive**, because the header name is documented as `X-Magpie-Model` while servers are free to send any casing. Blank values are treated as "no header".
- `/magpie-model` has no `ctx.ui` dependency for the value itself, so it also answers meaningfully in `print` / `json` modes where there is no UI to notify.

## Development

```bash
node --test magpie-model.test.ts
```

## License

[MIT](LICENSE)
