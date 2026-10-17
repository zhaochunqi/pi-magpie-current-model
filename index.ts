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
 *
 * The header parsing and text formatting live in `magpie-model.ts`; this file
 * is only the pi glue (events, status line, command).
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	commandLine,
	groupLabel,
	headerValue,
	MAGPIE_MODEL_HEADER,
	statusLine,
	type CurrentModel,
} from "./magpie-model.ts";

const STATUS_KEY = "magpie-current-model";

export default function magpieCurrentModel(pi: ExtensionAPI): void {
	let liveCtx: ExtensionContext | undefined;
	let served: string | undefined;

	function current(ctx: ExtensionContext | undefined): CurrentModel {
		return { group: groupLabel(ctx?.model), served };
	}

	function render(ctx: ExtensionContext | undefined): void {
		if (!ctx?.hasUI) return;
		liveCtx = ctx;
		ctx.ui.setStatus(STATUS_KEY, statusLine(current(ctx)));
	}

	pi.on("session_start", (_event, ctx) => {
		liveCtx = ctx;
		served = undefined;
		render(ctx);
	});

	pi.on("model_select", (_event, ctx) => {
		liveCtx = ctx;
		served = undefined;
		render(ctx);
	});

	pi.on("after_provider_response", (event, ctx) => {
		liveCtx = ctx;
		const reported = headerValue(event.headers, MAGPIE_MODEL_HEADER);
		if (reported) served = reported;
		render(ctx);
	});

	pi.registerCommand("magpie-model", {
		description: "Show the model magpie actually ran for the last request",
		handler: async (_args, ctx) => {
			ctx.ui.notify(commandLine(current(ctx ?? liveCtx)), "info");
		},
	});
}