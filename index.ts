/**
 * pi-magpie-current-model
 *
 * When pi talks to magpie through a *group* model (e.g. "先用免费再付费"),
 * pi only knows the group name, not which member actually served the request.
 * magpie reports the concrete model in the `X-Magpie-Model` response header
 * (e.g. "workbuddy-ai/step-5-preview" or "opencode-go/kimi-k3").
 *
 * This extension captures that header and shows the real model name in a pi
 * status line, so you always know what actually ran. It also exposes
 * `/magpie-model` to print the current value on demand.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const STATUS_KEY = "magpie-current-model";

function headerValue(headers: Record<string, string> | undefined, name: string): string | undefined {
	if (!headers) return undefined;
	const target = name.toLowerCase();
	for (const key of Object.keys(headers)) {
		if (key.toLowerCase() === target) return headers[key];
	}
	return undefined;
}

export default function magpieCurrentModel(pi: ExtensionAPI): void {
	let liveCtx: ExtensionContext | undefined;
	let actualModel: string | undefined;

	function groupLabel(ctx: ExtensionContext | undefined): string {
		const m = ctx?.model;
		return m?.name ?? m?.id ?? "model";
	}

	function render(ctx: ExtensionContext | undefined): void {
		if (!ctx?.hasUI) return;
		liveCtx = ctx;
		const group = groupLabel(ctx);
		const shown = actualModel ?? group;
		const suffix = actualModel && actualModel !== group ? `  (group: ${group})` : "";
		ctx.ui.setStatus(STATUS_KEY, `magpie: ${shown}${suffix}`);
	}

	pi.on("session_start", (_event, ctx) => {
		liveCtx = ctx;
		actualModel = undefined;
		render(ctx);
	});

	pi.on("model_select", (_event, ctx) => {
		liveCtx = ctx;
		actualModel = undefined;
		render(ctx);
	});

	pi.on("after_provider_response", (event, ctx) => {
		liveCtx = ctx;
		const served = headerValue(event.headers, "x-magpie-model");
		if (served) actualModel = served;
		render(ctx);
	});

	pi.registerCommand("magpie-model", {
		description: "Show the model magpie actually ran for the last request",
		handler: async (_args, ctx) => {
			const group = groupLabel(ctx);
			const msg = actualModel
				? `magpie ran: ${actualModel} (selected group: ${group})`
				: `no request yet; selected group: ${group}`;
			ctx.ui.notify(msg, "info");
		},
	});
}