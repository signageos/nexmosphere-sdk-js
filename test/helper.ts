
export function timeout(ms?: number): Promise<unknown> {
	if (ms === void 0) {
		ms = 0;
	}

	return new Promise((resolve: any) => setTimeout(resolve, ms));
}

export async function waitUntil(predicate: () => Promise<any>, interval: number = 100): Promise<void> {

	while (true) {

		if (await predicate()) {
			break;
		}
		await timeout(interval);
	}
}

export async function wait(delay: number = 1e3): Promise<void> {
	return new Promise<void>((resolve: () => void) => setTimeout(() => resolve(), delay));
}
