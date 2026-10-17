# pi-magpie-current-model

A pi extension that shows the model magpie actually ran.

When pi uses a magpie *group* model, pi only knows the group name. magpie
reports the concrete member in the `X-Magpie-Model` response header. This
extension captures it and renders `magpie: <actual model>` as a status line
below the footer, plus a `/magpie-model` command.

## Install

```
pi install /path/to/pi-magpie-current-model
```

or for a single session:

```
pi -e /path/to/pi-magpie-current-model
```