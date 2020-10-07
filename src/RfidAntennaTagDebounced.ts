import ISerialPort from './ISerialPort';
import RfidAntenna, {RfidAntennaActions, RfidAntennaStates} from './RfidAntennaTag';
import { EventEmitter } from 'events';
import { debounceAction } from './util/debounce';

type AntennaTagStatesMap = {
	[tagNumber: number]: RfidAntennaStates | undefined;
};

class RfidAntennaTagDebounced extends EventEmitter {

	private readonly rfidAntenna: RfidAntenna;

	private state: AntennaTagStatesMap = {
		1: undefined,
		2: undefined,
		3: undefined,
		4: undefined,
	};

	private readonly handleStateChange: (tagNumber: number, newState: RfidAntennaStates) => void;

	constructor(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore value is never read is irrelevant
		private serialPort: ISerialPort,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore value is never read is irrelevant
		private address: number,
		debounceIntervalMs = 50,
	) {
		super();
		this.rfidAntenna = new RfidAntenna(serialPort, address);

		this.rfidAntenna
			.on(RfidAntennaActions.Placed, (tagNumber: number) => this.handlePlaced(tagNumber))
			.on(RfidAntennaActions.Picked, (tagNumber: number) => this.handlePicked(tagNumber));

		this.handleStateChange = debounceAction(
			(tagNumber: number, newState: RfidAntennaStates) => {
				if (newState !== this.state[tagNumber] && newState === RfidAntennaStates.PICKED) {
					this.state[tagNumber] = RfidAntennaStates.PICKED;
					this.emit(RfidAntennaActions.Picked, tagNumber);
				}
				if (newState !== this.state[tagNumber] && newState === RfidAntennaStates.PLACED) {
					this.state[tagNumber] = RfidAntennaStates.PLACED;
					this.emit(RfidAntennaActions.Placed, tagNumber);
				}
			},
			debounceIntervalMs,
		);

	}

	private handlePicked(tagNumber: number): void {
		this.handleStateChange(tagNumber, RfidAntennaStates.PICKED);
	}

	private handlePlaced(tagNumber: number): void {
		this.handleStateChange(tagNumber, RfidAntennaStates.PLACED);
	}

	public getPlacedTags(): Promise<Array<number>> {
		return this.rfidAntenna.getPlacedTags();
	}
}

export default RfidAntennaTagDebounced;
