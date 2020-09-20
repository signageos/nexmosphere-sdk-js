
export function timeout(ms?: number): Promise<unknown> {
	if (ms === void 0) {
		ms = 0;
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return new Promise((resolve: any) => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function waitUntil(predicate: () => Promise<any>, interval = 100): Promise<void> {

	while (true) { // eslint-disable-line no-constant-condition

		if (await predicate()) {
			break;
		}
		await timeout(interval);
	}
}

export async function wait(delay = 1e3): Promise<void> {
	return new Promise<void>((resolve: () => void) => setTimeout(() => resolve(), delay));
}
