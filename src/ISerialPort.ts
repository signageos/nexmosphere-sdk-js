export enum SerialPortEvent {
	MESSAGE = 'message',
}

interface ISerialPort {
	on(event: SerialPortEvent.MESSAGE, listener: (message: string) => void): void;
	removeListener(event: SerialPortEvent, listener: (...args: any[]) => void): void;
	removeAllListeners(event?: SerialPortEvent): void;
	sendMessage(message: string): void;
}

export default ISerialPort;
