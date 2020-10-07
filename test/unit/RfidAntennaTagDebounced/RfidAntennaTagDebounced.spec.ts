import MockSerialPort from '../MockSerialPort';
import * as should from 'should';
import RfidAntennaTagDebounced from '../../../src/RfidAntennaTagDebounced';
import { SerialPortEvent } from '../../../src/ISerialPort';
import { wait } from '../../helper';
import * as sinon from 'sinon';
import RfidAntenna, { RfidAntennaActions } from '../../../src/RfidAntennaTag';

describe('RfidAntennaTagDebounced', () => {

	it('should invoke only picked event (last message) and only once', async () => {
		const serialPort = new MockSerialPort();
		const address1 = 1;
		const rfidAntennaDebounced1 = new RfidAntennaTagDebounced(serialPort, address1);

		const onPickedCb = sinon.spy();
		const onPlacedCb = sinon.spy();

		rfidAntennaDebounced1
			.on('picked', onPickedCb)
			.on('placed', onPlacedCb);

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[1]');

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PB002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[0]');

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[1]');

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[1]');

		await wait(50);

		should(onPickedCb.calledOnce).be.true();
		should(onPlacedCb.calledOnce).be.false();

	});

	it('should correctly emit Picked when tag is picked', async function() {
		const serialPort = new MockSerialPort();
		const address = 1;
		const rfidAntennaTag = new RfidAntennaTagDebounced(serialPort, address);

		const pickedTagPromise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntennaTag
				.on(RfidAntennaActions.Picked, (tagNumber: number) => {
					resolve(tagNumber);
				})
				.on(RfidAntennaActions.Placed, (_tagNumber: number) => {
					reject();
				});
		});

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[1]');

		const pickedTagNumber = await pickedTagPromise;

		should(pickedTagNumber).be.equal(2);
	});

	it('should correctly emit event Placed when tag is placed', async function() {
		const serialPort = new MockSerialPort();
		const address = 1;
		const rfidAntennaTag = new RfidAntennaTagDebounced(serialPort, address);

		const placedPromiseTag = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntennaTag
				.on(RfidAntennaActions.Picked, (_tagNumber: number) => {
					reject();
				})
				.on(RfidAntennaActions.Placed, (tagNumber: number) => {
					resolve(tagNumber);
				});
		});

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PB002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[0]');

		const placedTagNumber = await placedPromiseTag;

		should(placedTagNumber).be.equal(2);
	});

	it('should not emit any Picked or Placed events when address is different', async function() {
		const serialPort = new MockSerialPort();
		const address = 1;
		const rfidAntennaTag = new RfidAntennaTagDebounced(serialPort, address);

		const onPickedCb = sinon.spy();
		const onPlacedCb = sinon.spy();

		rfidAntennaTag.on(RfidAntennaActions.Picked, onPickedCb).on(RfidAntennaActions.Placed, onPlacedCb);

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU004]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X002A[1]');

		await wait(2e2);

		onPickedCb.callCount.should.equal(0);
		onPlacedCb.callCount.should.equal(0);
	});

	it('should correctly emit Picked events for multiple antennas', async function() {
		const serialPort = new MockSerialPort();
		const address1 = 1;
		const rfidAntenna1 = new RfidAntennaTagDebounced(serialPort, address1);

		const address2 = 2;
		const rfidAntenna2 = new RfidAntennaTagDebounced(serialPort, address2);

		const antenna1PickedTagPromise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntenna1
				.on(RfidAntennaActions.Picked, (tagNumber: number) => {
					resolve(tagNumber);
				})
				.on(RfidAntennaActions.Placed, (_tagNumber: number) => {
					reject();
				});
		});

		const antenna2PickedTagPromise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntenna2
				.on(RfidAntennaActions.Picked, (tagNumber: number) => {
					resolve(tagNumber);
				})
				.on(RfidAntennaActions.Placed, (_tagNumber: number) => {
					reject();
				});
		});

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU001]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[1]');

		let pickedTagNumber = await antenna1PickedTagPromise;

		should(pickedTagNumber).be.equal(1);

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X002A[1]');

		pickedTagNumber = await antenna2PickedTagPromise;

		should(pickedTagNumber).be.equal(2);
	});

	it('should correctly emit Placed events for multiple antennas', async function() {
		const serialPort = new MockSerialPort();
		const address1 = 1;
		const rfidAntenna1 = new RfidAntennaTagDebounced(serialPort, address1);

		const address2 = 2;
		const rfidAntenna2 = new RfidAntennaTagDebounced(serialPort, address2);

		const antenna1PlacedTagPromise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntenna1
				.on(RfidAntennaActions.Picked, (_tagNumber: number) => {
					reject();
				})
				.on(RfidAntennaActions.Placed, (tagNumber: number) => {
					resolve(tagNumber);
				});
		});

		const antenna2PlacedTagPromise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntenna2
				.on(RfidAntennaActions.Picked, (_tagNumber: number) => {
					reject();
				})
				.on(RfidAntennaActions.Placed, (tagNumber: number) => {
					resolve(tagNumber);
				});
		});

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PB001]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[0]');

		let placedTagNumber = await antenna1PlacedTagPromise;

		should(placedTagNumber).be.equal(1);

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PB002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X002A[0]');

		placedTagNumber = await antenna2PlacedTagPromise;

		should(placedTagNumber).be.equal(2);
	});

	it('should correctly emit Picked event for multiple tags on one antenna', async function() {
		const serialPort = new MockSerialPort();
		const address = 1;
		const rfidAntennaTag = new RfidAntennaTagDebounced(serialPort, address);
		const tagNumber2 = 2;
		const tagNumber4 = 4;

		const pickedTag2Promise = new Promise((resolve: (tagNumber: number) => void, reject: (msg?: string) => void) => {
			rfidAntennaTag
				.on(RfidAntennaActions.Picked, (tagNumber: number) => {
					if (tagNumber === tagNumber2) {
						resolve(tagNumber2);
					}
				})
				.on(RfidAntennaActions.Placed, (_tagNumber: number) => {
					reject();
				});
		});

		const pickedTag4Promise = new Promise((resolve: (tagNumber: number) => void, reject: (msg?: string) => void) => {
			rfidAntennaTag
				.on(RfidAntennaActions.Picked, (tagNumber: number) => {
					if (tagNumber === tagNumber4) {
						resolve(tagNumber4);
					}
				})
				.on(RfidAntennaActions.Placed, (_tagNumber: number) => {
					reject();
				});
		});

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[1]');

		let pickedTagNumber = await pickedTag2Promise;

		should(pickedTagNumber).be.equal(2);

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU004]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[1]');

		pickedTagNumber = await pickedTag4Promise;

		should(pickedTagNumber).be.equal(4);

	});

	it('should correctly emit Picked events for multiple tags on multiple antennas', async function() {
		const serialPort = new MockSerialPort();
		const address1 = 1;
		const rfidAntenna1 = new RfidAntennaTagDebounced(serialPort, address1);
		const tagNumber1 = 1;

		const address2 = 2;
		const rfidAntenna2 = new RfidAntennaTagDebounced(serialPort, address2);
		const tagNumber2 = 2;

		const pickedTag1Antenna1Promise = new Promise((resolve: (tagNumber: number) => void) => {
			rfidAntenna1
				.on(RfidAntennaActions.Picked, (tagNumber: number) => {
					if (tagNumber === tagNumber1) {
						resolve(tagNumber);
					}
				});
		});

		const placedTag1Antenna2Promise = new Promise((resolve: (tagNumber: number) => void) => {
			rfidAntenna2
				.on(RfidAntennaActions.Placed, (tagNumber: number) => {
					if (tagNumber === tagNumber1) {
						resolve(tagNumber);
					}
				});
		});

		const pickedTag2Antenna2Promise = new Promise((resolve: (tagNumber: number) => void) => {
			rfidAntenna2
				.on(RfidAntennaActions.Picked, (tagNumber: number) => {
					if (tagNumber === tagNumber2) {
						resolve(tagNumber);
					}
				});
		});

		const placedTag2Antenna2Promise = new Promise((resolve: (tagNumber: number) => void) => {
			rfidAntenna2
				.on(RfidAntennaActions.Placed, (tagNumber: number) => {
					if (tagNumber === tagNumber2) {
						resolve(tagNumber);
					}
				});
		});

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU001]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[1]');

		let pickedTagNumber = await pickedTag1Antenna1Promise;

		should(pickedTagNumber).be.equal(1);

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PB001]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X002A[0]');

		let placedTagNumber = await placedTag1Antenna2Promise;

		should(placedTagNumber).be.equal(1);

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PU002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X002A[1]');

		pickedTagNumber = await pickedTag2Antenna2Promise;

		should(pickedTagNumber).be.equal(2);

		serialPort.emit(SerialPortEvent.MESSAGE, 'XR[PB002]');
		serialPort.emit(SerialPortEvent.MESSAGE, 'X002A[0]');

		placedTagNumber = await placedTag2Antenna2Promise;

		should(placedTagNumber).be.equal(2);
	});

	it('should get tag numbers on antenna when some are placed', async function() {
		const serialPort = new MockSerialPort();
		const address1 = 7;
		const rfidAntenna1 = new RfidAntenna(serialPort, address1);
		const tagNumbersPromise = rfidAntenna1.getPlacedTags();

		await wait(10);
		const sentMessages = serialPort.getSentMessages();
		should(sentMessages).deepEqual(['X007B[]']);

		serialPort.emit(SerialPortEvent.MESSAGE, 'X007B[ d004 d002 d000 d000]');

		const tagNumbers = await tagNumbersPromise;
		should(tagNumbers).be.deepEqual([4, 2]);
	});

	it('should get tag numbers on antenna when all are placed', async function() {
		const serialPort = new MockSerialPort();
		const address1 = 1;
		const rfidAntenna1 = new RfidAntenna(serialPort, address1);
		const tagNumbersPromise = rfidAntenna1.getPlacedTags();

		await wait(10);
		const sentMessages = serialPort.getSentMessages();
		should(sentMessages).deepEqual(['X001B[]']);

		serialPort.emit(SerialPortEvent.MESSAGE, 'X001B[d001 d002 d003 d004]');

		const tagNumbers = await tagNumbersPromise;
		should(tagNumbers).be.deepEqual([1, 2, 3, 4]);
	});

	it('should get tag numbers on antenna when none is placed', async function() {
		const serialPort = new MockSerialPort();
		const address1 = 2;
		const rfidAntenna1 = new RfidAntenna(serialPort, address1);
		const tagNumbersPromise = rfidAntenna1.getPlacedTags();

		await wait(10);
		const sentMessages = serialPort.getSentMessages();
		should(sentMessages).deepEqual(['X002B[]']);

		serialPort.emit(SerialPortEvent.MESSAGE, 'X002B[d000 d000 d000 d000]');

		const tagNumbers = await tagNumbersPromise;
		should(tagNumbers).be.deepEqual([]);
	});

});
