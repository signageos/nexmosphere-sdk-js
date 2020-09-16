import { EventEmitter } from "events";
import { Duplex } from 'stream';
import { parseMessage, FormatType, CommandType } from "./MessageParser";

export enum ButtonActions {
	Pressed = 'pressed',
	Released = 'released',
}

export enum ButtonStates {
	PRESSED,
	RELEASED,
}

// tslint:disable:no-bitwise bitwise operations are required in this source file

class Button extends EventEmitter {
	private stream: Duplex;
	private address: number;
	/**
	 * `index` the button on the XN-185 board
	 * is zero based, can be 0-3
	 */
	private index: number;

	private state: ButtonStates;

	public constructor(
		stream: Duplex,
		address: number,
		index: number,
	) {
		super();
		this.stream = stream;
		this.address = address;
		this.index = index;
		this.state = ButtonStates.RELEASED;

		this.initStream();
	}

	public requestState(): void {
		const address = this.address.toString().padStart(3, '0');
		const msg = `X${address}A[]`;
		this.stream.write(msg);
	}

	private initStream(): void {

		this.stream.on('data', (chunk: Buffer) => {
			const chunkStr = chunk.toString();
			try {
				const cmd = parseMessage(chunkStr);

				if (cmd.type === CommandType.XTALK
					&& cmd.address === this.address + 1
					&& cmd.format === FormatType.SHORT
				) {

					if (!isNaN(Number(cmd.command))) {
						const value = Number(cmd.command);

						if (isButtonPressed(value, this.index) && this.state === ButtonStates.RELEASED) {
							this.handlePressed();
						} else {

							if (this.state === ButtonStates.PRESSED && !isButtonPressed(value, this.index)) {
								this.handleReleased();
							}
						}
					}
				}
			} catch (error) {
				// todo: how we react?
			}
		});
	}

	private handlePressed(): void {
		this.state = ButtonStates.PRESSED;
		this.emit(ButtonActions.Pressed);
	}

	private handleReleased(): void {
		this.state = ButtonStates.RELEASED;
		this.emit(ButtonActions.Released);
	}

}

/**
 *
 * @param value from the square brackets of the message
 * @param index of the Button
 * @returns `true` if the button is pressed
 */
export function isButtonPressed(value: number, index: number): boolean {
	const currentBit = (value & 1) << (index + 1);
	return !!(value & currentBit);
}

export default Button;
