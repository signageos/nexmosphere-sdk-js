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

	constructor(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore value is never read is relevant
		private serialPort: ISerialPort,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore value is never read is relevant
		private address: number,
	) {
		super();
		this.handleStateChange = this.handleStateChange.bind(this);
		this.rfidAntenna = new RfidAntenna(serialPort, address);
		const debouncedStateChangeHandler: _.DebouncedFunc<(tagNumber: number, newState: RfidAntennaStates) => void>
			= _.debounce(this.handleStateChange, 50, { trailing: true });

		this.rfidAntenna
			.on(RfidAntennaActions.Placed, debouncedStateChangeHandler)
			.on(RfidAntennaActions.Picked, debouncedStateChangeHandler);
	}

	public getAntennaState(): AntennaTagStatesMap {
		return this.state;
	}

	private handleStateChange(tagNumber: number, newState: RfidAntennaStates): void {

		if (newState !== this.state[tagNumber] && newState === RfidAntennaStates.PICKED) {
			this.handlePicked(tagNumber);
		}
		if (newState !== this.state[tagNumber] && newState === RfidAntennaStates.PLACED) {
			this.handlePlaced(tagNumber);
		}
	}

	public getPlacedTags(): Promise<Array<number>> {
		return this.rfidAntenna.getPlacedTags();
	}

	private handlePicked(tagNumber: number): void {
		this.state[tagNumber] = RfidAntennaStates.PICKED;
		this.emit(RfidAntennaActions.Picked, tagNumber);
	}

	private handlePlaced(tagNumber: number): void {
		this.state[tagNumber] = RfidAntennaStates.PLACED;
		this.emit(RfidAntennaActions.Placed, tagNumber);
	}

}

export default RfidAntennaTagDebounced;
