import { EventEmitter } from "events";
import { Duplex } from "stream";
import { parseMessage, CommandType, FormatType } from "./MessageParser";

export enum RfidAntennaActions {
	Picked = 'picked',
	Placed = 'placed',
}

export enum RfidAntennaStates {
	PICKED,
	PLACED,
}

const COMMAND_TAG_NUMBERS_REGEX: RegExp = /^([ \t]*d\d{3}){4}$/;

class RfidAntenna extends EventEmitter {

	private state: RfidAntennaStates;
	private lastTagNumber: number;
	private eventEmitter: EventEmitter;

	constructor(
		private stream: Duplex,
		private address: number,
	) {
		super();
		this.eventEmitter = new EventEmitter();
		this.initStream();
	}

	public async getPlacedTags(): Promise<Array<number>> {
		const address = this.address.toString().padStart(3, '0');
		this.stream.write(`X${address}B[]`);

		const cmdStr: string = await this.waitForResponseStatus();
		const cmdStrTrimmed: string = cmdStr.replace(/[ \t]{2,}/g, ' ').trim();
		const tagParts: string[] = cmdStrTrimmed.split(' ');

		return tagParts
			.map((x: string) => x.substr(1))
			.map((x: string) => parseInt(x))
			.filter((x: number) => x !== 0);
	}

	private initStream(): void {

		this.stream.on('data', (chunk: Buffer) => {
			const chunkStr = chunk.toString();
			try {
				const cmd = parseMessage(chunkStr);

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

			} catch (error) {
				// todo: how we react?
				console.log(error.message);
				console.log(this.state);
			}
		});
	}

	private handlePicked(tagNumber: number): void {
		this.emit(RfidAntennaActions.Picked, tagNumber);
	}

	private handlePlaced(tagNumber: number): void {
		this.emit(RfidAntennaActions.Placed, tagNumber);
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
