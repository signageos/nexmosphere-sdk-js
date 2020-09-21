import ISerialPort, { SerialPortEvent } from '../../src/ISerialPort';
import { EventEmitter } from 'events';

export default class MockSerialPort implements ISerialPort {

	private eventEmitter: EventEmitter;
	private sentMessages: string[] = [];

	constructor() {
		this.eventEmitter = new EventEmitter();
	}

	public on(event: SerialPortEvent.MESSAGE, listener: (message: string) => void): void {
		this.eventEmitter.on(event, listener);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public emit(event: SerialPortEvent, ...args: any[]): void {
		this.eventEmitter.emit(event, ...args);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public removeListener(event: SerialPortEvent, listener: (...args: any[]) => void): void {
		this.eventEmitter.removeListener(event, listener);
	}

	public removeAllListeners(event?: SerialPortEvent): void {
		if (event) {
			this.eventEmitter.removeAllListeners(event);
		} else {
			this.eventEmitter.removeAllListeners();
		}
	}

	public sendMessage(message: string): void {
		this.sentMessages.push(message);
	}

	public getSentMessages(): string[] {
		return this.sentMessages;
	}
}
