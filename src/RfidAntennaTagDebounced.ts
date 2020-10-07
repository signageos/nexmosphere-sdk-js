import ISerialPort from './ISerialPort';
import RfidAntenna, {RfidAntennaActions, RfidAntennaStates} from './RfidAntennaTag';
import * as _ from 'lodash';
import { EventEmitter } from 'events';

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

	private readonly handleStateChange: _.DebouncedFunc<(tagNumber: number, newState: RfidAntennaStates) => void>;

	constructor(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore value is never read is relevant
		private serialPort: ISerialPort,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore value is never read is relevant
		private address: number,
		debounceIntervalMs = 50,
	) {
		super();
		this.rfidAntenna = new RfidAntenna(serialPort, address);

		this.rfidAntenna
			.on(RfidAntennaActions.Placed, (tagNumber: number) => this.handlePlaced(tagNumber))
			.on(RfidAntennaActions.Picked, (tagNumber: number) => this.handlePicked(tagNumber));

		this.handleStateChange = _.debounce(
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
			{ trailing: true },
		);

	}

	public getAntennaState(): AntennaTagStatesMap {
		return this.state;
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
