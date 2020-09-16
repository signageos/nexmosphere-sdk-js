
export function timeout(ms?: number) {
	if (ms === void 0) {
		ms = 0;
	}

	return new Promise((resole: any) => setTimeout(resole, ms));
}

export async function waitUntil(predicate: () => Promise<any>, interval: number = 100) {

	while (true) {

		if (await predicate()) {
			break;
		}
		await timeout(interval);
	}
}
