import { EventEmitter } from 'events';
import {
	parseMessage,
	CommandType,
	FormatType,
	InvalidArgumentError,
	UnknownCommandError,
} from './MessageParser';
import ISerialPort, { SerialPortEvent } from './ISerialPort';

export enum RfidAntennaActions {
	Picked = 'picked',
	Placed = 'placed',
}

export enum RfidAntennaStates {
	PLACED,
	PICKED,
}

const COMMAND_TAG_NUMBERS_REGEX = /^([ \t]*d\d{3}){4}$/;

class RfidAntenna extends EventEmitter {

	private state: RfidAntennaStates;
	private lastTagNumber: number;
	private eventEmitter: EventEmitter;

	constructor(
		private serialPort: ISerialPort,
		private address: number,
	) {
		super();
		this.eventEmitter = new EventEmitter();
		this.initStream();
	}

	public async getPlacedTags(): Promise<Array<number>> {
		const address = this.address.toString().padStart(3, '0');
		this.serialPort.sendMessage(`X${address}B[]`);

		const cmdStr: string = await this.waitForResponseStatus();
		const cmdStrTrimmed: string = cmdStr.replace(/[ \t]{2,}/g, ' ').trim();
		const tagParts: string[] = cmdStrTrimmed.split(' ');

		return tagParts
			.map((x: string) => x.substr(1))
			.map((x: string) => parseInt(x))
			.filter((x: number) => x !== 0);
	}

	public getAntennaState(): RfidAntennaStates {
		return this.state;
	}

	private initStream(): void {

		this.serialPort.on(SerialPortEvent.MESSAGE, (message: string) => {
			try {
				const cmd = parseMessage(message);

				if (cmd.type === 'antenna') {
					// tag was placed or put
					if (cmd.command === 'PU') {
						this.state = RfidAntennaStates.PICKED;
					} else if (cmd.command === 'PB') {
						this.state = RfidAntennaStates.PLACED;
					}
					this.lastTagNumber = cmd.tagIndex;

				} else if (cmd.type === CommandType.XTALK
					&& cmd.address === this.address
					&& cmd.format === FormatType.SHORT
				) {
					// from where tag was placed or put
					if (cmd.command === '1') {
						this.handlePicked(this.lastTagNumber);
					} else if (cmd.command === '0') {
						this.handlePlaced(this.lastTagNumber);
					}

				} else if (cmd.type === CommandType.XTALK
					&& cmd.format === FormatType.LONG
					&& cmd.address === this.address
					&& cmd.command.match(COMMAND_TAG_NUMBERS_REGEX)
				) {
					this.handleState(cmd.command);
				}

			} catch (error: unknown) {

				if (error instanceof Error
					&& !(error instanceof InvalidArgumentError)
					&& !(error instanceof UnknownCommandError)
				) {
					console.error(error.message); // eslint-disable-line no-console
				}
			}
		});
	}

	private handlePicked(tagNumber: number): void {
		this.emit(RfidAntennaActions.Picked, tagNumber, this.state);
	}

	private handlePlaced(tagNumber: number): void {
		this.emit(RfidAntennaActions.Placed, tagNumber, this.state);
	}

	private handleState(command: string): void {
		this.eventEmitter.emit('status_received', command);
	}

	private waitForResponseStatus(): Promise<string> {
		return new Promise((resolve: (command: string) => void) => {
			this.eventEmitter.once('status_received', resolve);
		});
	}

}

export default RfidAntenna;
