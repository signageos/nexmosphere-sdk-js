import { EventEmitter } from 'events';
import {
    parseMessage,
    FormatType,
    CommandType,
    InvalidArgumentError,
    UnknownCommandError,
} from './MessageParser';
import ISerialPort, { SerialPortEvent } from './ISerialPort';

class AirButton extends EventEmitter {
    private serialPort: ISerialPort;
    private address: number;

    public constructor(port: ISerialPort, address: number) {
        super()
        this.serialPort = port;
        this.address = address;
        this.initStream();
    }

    private initStream(): void {
        this.serialPort.on(SerialPortEvent.MESSAGE, (message) => {
            try {
                const cmd = parseMessage(message);
                if (cmd.type === CommandType.XTALK
                    && cmd.address === this.address
                    && cmd.format === FormatType.LONG) {
                    cmd.command = cmd.command.replace('Bs=', '');
                    if (cmd.command === 'FAR') {
                        this.emit('far', 'Uzakta bir el var');
                    } else if (cmd.command === 'NEAR') {
                        this.emit('near', 'Yakinda bir el var');
                    } else if (cmd.command === 'IDLE') {
                        this.emit('idle', 'El yok??');
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error
					&& !(error instanceof InvalidArgumentError)
					&& !(error instanceof UnknownCommandError)
                ) {
                    // eslint-disable-next-line no-undef
                    console.error(error.message); // eslint-disable-line no-console
                }
            }
        })
    }
}

export default AirButton;
