import assert from "node:assert/strict";
import { test } from "node:test";
import {
	commandLine,
	groupLabel,
	headerValue,
	statusLine,
	MAGPIE_MODEL_HEADER,
} from "./magpie-model.ts";

test("header lookup is case-insensitive on both sides", () => {
	const doc = { "X-Magpie-Model": "opencode-go/kimi-k3" };
	const lower = { "x-magpie-model": "workbuddy-ai/step-5-preview" };
	const mixed = { "x-MAGPIE-model": "anthropic/claude-sonnet-5" };
	assert.equal(headerValue(doc, "x-magpie-model"), "opencode-go/kimi-k3");
	assert.equal(headerValue(lower, MAGPIE_MODEL_HEADER), "workbuddy-ai/step-5-preview");
	assert.equal(headerValue(mixed, "X-Magpie-Model"), "anthropic/claude-sonnet-5");
});

test("missing, blank and non-magpie headers mean 'no header'", () => {
	assert.equal(headerValue(undefined, "x-magpie-model"), undefined);
	assert.equal(headerValue({}, "x-magpie-model"), undefined);
	assert.equal(headerValue({ "x-magpie-model": "   " }, "x-magpie-model"), undefined);
	assert.equal(headerValue({ "x-other-model": "some/model" }, "x-magpie-model"), undefined);
});

test("header values are trimmed", () => {
	assert.equal(
		headerValue({ "x-magpie-model": "  opencode-go/kimi-k3\n" }, "x-magpie-model"),
		"opencode-go/kimi-k3",
	);
});

test("group label prefers the display name, then the id, then a placeholder", () => {
	assert.equal(groupLabel({ name: "Free first", id: "group/free-first" }), "Free first");
	assert.equal(groupLabel({ id: "group/free-first" }), "group/free-first");
	assert.equal(groupLabel({ name: "   " }), "model");
	assert.equal(groupLabel(undefined), "model");
});

test("before any request the status line echoes the selection", () => {
	assert.equal(statusLine({ group: "Free first" }), "magpie: Free first");
});

test("a group model shows the member and keeps the group readable", () => {
	assert.equal(
		statusLine({ group: "Free first", served: "workbuddy-ai/step-5-preview" }),
		"magpie: workbuddy-ai/step-5-preview  (group: Free first)",
	);
});

test("the served model equals the selection: no redundant group suffix", () => {
	assert.equal(statusLine({ group: "Kimi K3", served: "Kimi K3" }), "magpie: Kimi K3");
});

test("a plain model is reported without a group suffix", () => {
	assert.equal(
		statusLine({ group: "Kimi K3", served: "opencode-go/kimi-k3" }),
		"magpie: opencode-go/kimi-k3  (group: Kimi K3)",
	);
});

test("command output distinguishes 'ran' from 'nothing yet'", () => {
	assert.equal(
		commandLine({ group: "Free first", served: "workbuddy-ai/step-5-preview" }),
		"magpie ran: workbuddy-ai/step-5-preview (selected group: Free first)",
	);
	assert.equal(commandLine({ group: "Free first" }), "no request yet; selected group: Free first");
});
