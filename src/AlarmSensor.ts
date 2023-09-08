import { EventEmitter } from 'events';
import {
    parseMessage,
    FormatType,
    CommandType,
    InvalidArgumentError,
    UnknownCommandError,
} from './MessageParser';
import ISerialPort, { SerialPortEvent } from './ISerialPort';

class AlarmSensor extends EventEmitter {
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
                    && cmd.format === FormatType.SHORT) {
                    if (!isNaN(Number(cmd.command))) {
                        if (cmd.command === '0') {
                            this.emit('phonePlaced', 'Telefon koyuldu');
                        } else if (cmd.command === '3') {
                            this.emit('phonePicked', 'Telefon kaldirildi');
                        } else if (cmd.command === '4') {
                            this.emit('alarmPlaced', 'Telefonsuz Alarm koyuldu');
                        } else  if (cmd.command === '7') {
                            this.emit('alarmPicked', 'Telefonsuz Alarm kaldirildi');
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

export default AlarmSensor;
