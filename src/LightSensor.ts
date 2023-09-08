import { EventEmitter } from 'events';
import {
    parseMessage,
    FormatType,
    CommandType,
    InvalidArgumentError,
    UnknownCommandError,
} from './MessageParser';
import ISerialPort, { SerialPortEvent } from './ISerialPort';

class LightSensor extends EventEmitter {
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
                if (!cmd) return;
                if (cmd.type === CommandType.XTALK
                    && cmd.address === this.address
                    && cmd.format === FormatType.SHORT) {
                    if (!isNaN(Number(cmd.command))) {
                        if (cmd.command === '3') {
                            this.emit('Open');
                        } else if (cmd.command === '0') {
                            this.emit('Off');
                        }
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

export default LightSensor;
