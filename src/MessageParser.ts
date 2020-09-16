
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

export interface IAddressableCommand {
	type: CommandType;
	address: number;
	command: string;
	format: FormatType;
}

export interface IXRAntennaCommand {
	type: 'antenna';
	command: 'PU' | 'PB';
	tagIndex: number;
}

const SHORT_XTALK_COMMAND_REGEX = new RegExp(/^X\d{3}A\[\d{0,3}\]$/, 'i');
const RFID_ANTENNA_XTALK_REGEX = new RegExp(/^XR\[P(U|B)\d{3}\]$/, 'i');

export function parseMessage(message: string): IAddressableCommand | IXRAntennaCommand {

	if (message.length === 0) {
		throw new InvalidArgumentError('Message is empty.');
	}
	let format;
	let type;
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
		return createAddresableCommand(command, type, addressConverted, format);
	}

	const xTalkRfidAntennaMatch: RegExpMatchArray | null = message.match(RFID_ANTENNA_XTALK_REGEX);

	if (xTalkRfidAntennaMatch) {
		type = 'antenna';
		const bracketsContents = message.slice(message.indexOf('[') + 1, message.indexOf(']'));
		const xrAntennaCmd: 'PU' | 'PB' = bracketsContents.substr(0, 2) as 'PU' | 'PB';
		const tagIndex = parseInt(bracketsContents.substr(2, 3));

		return createXRAntennaCommand(xrAntennaCmd, tagIndex);
	}

	throw new UnknownCommandError();
}

export function createAddresableCommand(
	command: string,
	type: CommandType,
	address: number,
	format: FormatType,
): IAddressableCommand {

	return {
		command,
		type,
		address,
		format,
	};
}

export function createXRAntennaCommand(command: 'PU' | 'PB', tagIndex: number): IXRAntennaCommand {

	return {
		type: 'antenna',
		command,
		tagIndex,
	};
}
