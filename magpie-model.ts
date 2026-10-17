/**
 * Pure "which model actually ran" logic for pi-magpie-current-model.
 *
 * No pi APIs, no I/O, no network: everything here is a deterministic function
 * of (selected model, response headers) so it can be unit-tested with
 * `node --test`. `index.ts` holds the pi glue on top of these helpers.
 */

/** Response header magpie sets to the model that actually served a group request. */
export const MAGPIE_MODEL_HEADER = "x-magpie-model";

/** The selected model as pi reports it. `Model` declares both fields, but a
 *  group entry can carry no display name, so treat them as optional here. */
export interface SelectedModel {
	name?: string;
	id?: string;
}

/** What the status line and the command know about the current turn. */
export interface CurrentModel {
	/** Label of the selected model (the group, for a group model). */
	group: string;
	/** The member magpie reported, once a response has been seen. */
	served?: string;
}

/**
 * Case-insensitive header lookup. Fetch and OpenAI-compatible servers differ in
 * the casing they send, and the header name in the docs is `X-Magpie-Model`,
 * so the comparison ignores case on both sides. An absent or blank value
 * counts as "no header" rather than an empty model name.
 */
export function headerValue(
	headers: Record<string, string> | undefined,
	name: string = MAGPIE_MODEL_HEADER,
): string | undefined {
	if (!headers) return undefined;
	const target = name.toLowerCase();
	for (const [key, value] of Object.entries(headers)) {
		if (key.toLowerCase() !== target) continue;
		const text = value?.trim();
		return text ? text : undefined;
	}
	return undefined;
}

/** Best available label for the selected model; `model` when pi knows neither. */
export function groupLabel(model?: SelectedModel): string {
	return model?.name?.trim() || model?.id?.trim() || "model";
}

/**
 * The status line under the footer. Without a served model it echoes the
 * selection, because nothing has run yet; once magpie reports a member that is
 * different from the selection, the group stays visible in brackets so the
 * routing that was asked for is still readable.
 */
export function statusLine({ group, served }: CurrentModel): string {
	if (!served) return `magpie: ${group}`;
	if (served === group) return `magpie: ${served}`;
	return `magpie: ${served}  (group: ${group})`;
}

/** The `/magpie-model` output. */
export function commandLine({ group, served }: CurrentModel): string {
	return served
		? `magpie ran: ${served} (selected group: ${group})`
		: `no request yet; selected group: ${group}`;
}
