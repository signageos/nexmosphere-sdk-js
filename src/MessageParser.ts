
export enum CommandType {
	XTALK = "X",
	GENERIC = "G",
	SYSTEM = "S",
	DIAGNOSTIC = "D",
}

export enum FormatType {
	SHORT = "A",
	LONG = "B",
	SETTING = "S",
}

export class InvalidArgumentError extends Error {
	constructor(errMsg?: string) {
		super(errMsg ?? 'Invalid argument error.');
		this.name = 'InvalidArgumentError';
		Object.setPrototypeOf(this, InvalidArgumentError.prototype);
	}
}

export class UnknownCommandError extends Error {
	constructor(errMsg?: string) {
		super(errMsg ?? 'Unknown command.');
		this.name = 'UnknownCommandError';
		Object.setPrototypeOf(this, UnknownCommandError.prototype);
	}
}

export interface ICommand {
	type: CommandType;
	address: number;
	command: string;
	format: FormatType;
}

const SHORT_XTALK_COMMAND_REGEX = new RegExp(/^X\d{3}A\[\d{0,3}\]$/, 'i');

export function parseMessage(message: string): ICommand {

	if (message.length === 0) {
		throw new InvalidArgumentError('Message is empty.');
	}
	let format: FormatType;
	let type: CommandType;
	let address: string;
	let command: string;

	const xTalkShortCommandMatch: RegExpMatchArray | null = message.match(SHORT_XTALK_COMMAND_REGEX);

	if (xTalkShortCommandMatch) {
		type = CommandType.XTALK;
		format = FormatType.SHORT;
		address = message.substr(1, 3); // i.e 008
		address = address.replace(/^0+/, '');
		command = message.slice(message.indexOf('[') + 1, message.indexOf(']'));

		const addressConverted = Number(address);
		return createCommand(command, type, addressConverted, format);
	}

	throw new UnknownCommandError();
}

export function createCommand(
	command: string,
	type: CommandType,
	address: number,
	format: FormatType,
): ICommand {

	return {
		command,
		type,
		address,
		format,
	};
}
