
export function debounceAction<T, S>(action: (arg1: T, arg2: S) => void, timeout: number): (
	arg1: T,
	arg2: S,
) => void {
	let timer: any;

	return (arg1: T, arg2: S) => {
		const nextAction = () => action(arg1, arg2);
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(nextAction, timeout);
	};
}
