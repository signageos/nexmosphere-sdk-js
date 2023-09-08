import { EventEmitter } from 'events';
import {
    parseMessage,
    FormatType,
    CommandType,
    InvalidArgumentError,
    UnknownCommandError,
} from './MessageParser';
import ISerialPort, { SerialPortEvent } from './ISerialPort';

class PresenceSensor extends EventEmitter {
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
                    cmd.command = cmd.command.replace('Dz=', '');
                    if (cmd.command === 'AB') {
                        this.emit('close', 'Cok yakin');
                    } else if (!isNaN(Number(cmd.command))) {
                        this.emit('distanced', `Bu kadar yakin ${cmd.command}`);
                    } else if (cmd.command === 'XX') {
                        this.emit('vanished', 'Yok olduuuuu');
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

export default PresenceSensor;
