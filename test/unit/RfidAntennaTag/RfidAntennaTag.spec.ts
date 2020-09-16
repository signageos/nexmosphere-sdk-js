
import * as should from 'should';
import { Duplex, DuplexOptions } from 'stream';
import RfidAntenna, { RfidAntennaActions } from '../../../src/RfidAntennaTag';
import { wait } from '../../helper';
import * as sinon from 'sinon';

class MockDuplex extends Duplex {

	public constructor(options?: DuplexOptions) {
		super(options);
	}

	public _read(_size: number) {
	}
	public _write(_chunk: Buffer, _encoding: any, next: () => void) {
		const chunkStr = _chunk.toString();
		if (chunkStr === 'X007B[]') {
			const mockHWResponse = 'X007B[ d004 d002 d000 d000]';
			this.push(mockHWResponse);
		}
		if (chunkStr === 'X001B[]') {
			const mockHWResponse = 'X001B[d001 d002 d003 d004]';
			this.push(mockHWResponse);
		}
		if (chunkStr === 'X002B[]') {
			const mockHWResponse = 'X002B[d000 d000 d000 d000]';
			this.push(mockHWResponse);
		}
		next();
	}
}

describe('RfidAntennaTag', () => {

	it('should correctly emit Picked when tag is picked', async function() {
		const duplexStream = new MockDuplex();
		const address = 1;
		const rfidAntennaTag = new RfidAntenna(duplexStream, address);

		const pickedTagPromise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntennaTag
				.on(RfidAntennaActions.Picked, (tagNumber: number) => {
					resolve(tagNumber);
				})
				.on(RfidAntennaActions.Placed, (_tagNumber: number) => {
					reject();
				});
		});

		duplexStream.push(`XR[PU002]`);
		duplexStream.push(`X001A[1]`);

		const pickedTagNumber = await pickedTagPromise;

		should(pickedTagNumber).be.equal(2);

		duplexStream.end();
	});

	it('should correctly emit event Placed when tag is placed', async function() {
		const duplexStream = new MockDuplex();
		const address = 1;
		const rfidAntennaTag = new RfidAntenna(duplexStream, address);

		const placedPromiseTag = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntennaTag
				.on(RfidAntennaActions.Picked, (_tagNumber: number) => {
					reject();
				})
				.on(RfidAntennaActions.Placed, (tagNumber: number) => {
					resolve(tagNumber);
				});
		});

		duplexStream.push(`XR[PB002]`);
		duplexStream.push(`X001A[0]`);

		const placedTagNumber = await placedPromiseTag;

		should(placedTagNumber).be.equal(2);

		duplexStream.end();
	});

	it('should not emit any Picked or Placed events when address is different', async function() {
		const duplexStream = new MockDuplex();
		const address = 1;
		const rfidAntennaTag = new RfidAntenna(duplexStream, address);

		const onPickedCb = sinon.spy();
		const onPlacedCb = sinon.spy();

		rfidAntennaTag.on(RfidAntennaActions.Picked, onPickedCb).on(RfidAntennaActions.Placed, onPlacedCb);

		duplexStream.push(`XR[PU004]`);
		duplexStream.push(`X002A[1]`);

		await wait(2e2);

		onPickedCb.callCount.should.equal(0);
		onPlacedCb.callCount.should.equal(0);

		duplexStream.end();
	});

	it('should correctly emit Picked events for multiple antennas', async function() {
		const duplexStream = new MockDuplex();
		const address1 = 1;
		const rfidAntenna1 = new RfidAntenna(duplexStream, address1);

		const address2 = 2;
		const rfidAntenna2 = new RfidAntenna(duplexStream, address2);

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

		duplexStream.push(`XR[PU001]`);
		duplexStream.push(`X001A[1]`);

		let pickedTagNumber = await antenna1PickedTagPromise;

		should(pickedTagNumber).be.equal(1);

		duplexStream.push(`XR[PU002]`);
		duplexStream.push(`X002A[1]`);

		pickedTagNumber = await antenna2PickedTagPromise;

		should(pickedTagNumber).be.equal(2);
	});

	it('should correctly emit Placed events for multiple antennas', async function() {
		const duplexStream = new MockDuplex();
		const address1 = 1;
		const rfidAntenna1 = new RfidAntenna(duplexStream, address1);

		const address2 = 2;
		const rfidAntenna2 = new RfidAntenna(duplexStream, address2);

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

		duplexStream.push(`XR[PB001]`);
		duplexStream.push(`X001A[0]`);
	
		let placedTagNumber = await antenna1PlacedTagPromise;

		should(placedTagNumber).be.equal(1);

		duplexStream.push(`XR[PB002]`);
		duplexStream.push(`X002A[0]`);
	
		placedTagNumber = await antenna2PlacedTagPromise;

		should(placedTagNumber).be.equal(2);
	});

	it('should correctly emit Picked event for multiple tags on one antenna', async function() {
		const duplexStream = new MockDuplex();
		const address = 1;
		const rfidAntennaTag = new RfidAntenna(duplexStream, address);
		const tagNumber2 = 2;
		const tagNumber4 = 4;

		const pickedTag2Promise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
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

		const pickedTag4Promise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
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
		
		duplexStream.push(`XR[PU002]`);
		duplexStream.push(`X001A[1]`);

		let pickedTagNumber = await pickedTag2Promise;

		should(pickedTagNumber).be.equal(2);

		duplexStream.push(`XR[PU004]`);
		duplexStream.push(`X001A[1]`);

		pickedTagNumber = await pickedTag4Promise;

		should(pickedTagNumber).be.equal(4);

		duplexStream.end();
	});

	it('should correctly emit Placed event for multiple tags on one antenna', async function() {
		const duplexStream = new MockDuplex();
		const address = 1;
		const rfidAntennaTag = new RfidAntenna(duplexStream, address);
		const tagNumber2 = 2;
		const tagNumber4 = 4;


		const pickedTag2Promise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntennaTag
				.on(RfidAntennaActions.Placed, (tagNumber: number) => {
					if (tagNumber === tagNumber2) {
						resolve(tagNumber);
					}
				})
				.on(RfidAntennaActions.Picked, (_tagNumber: number) => {
					reject();
				});
		});

		const pickedTag4Promise = new Promise((resolve: (tagNumber: number) => void, reject: () => void) => {
			rfidAntennaTag
				.on(RfidAntennaActions.Placed, (tagNumber: number) => {
					if (tagNumber === tagNumber4) {
						resolve(tagNumber);
					}
				})
				.on(RfidAntennaActions.Picked, (_tagNumber: number) => {
					reject();
				});
		});

		duplexStream.push(`XR[PB002]`);
		duplexStream.push(`X001A[0]`);

		let placedTagNumber = await pickedTag2Promise;

		should(placedTagNumber).be.equal(2);

		duplexStream.push(`XR[PB004]`);
		duplexStream.push(`X001A[0]`);

		placedTagNumber = await pickedTag4Promise;

		should(placedTagNumber).be.equal(placedTagNumber);

		duplexStream.end();
	});

	it('should correctly emit Picked events for multiple tags on multiple antennas', async function() {
		const duplexStream = new MockDuplex();
		const address1 = 1;
		const rfidAntenna1 = new RfidAntenna(duplexStream, address1);
		const tagNumber1 = 1;

		const address2 = 2;
		const rfidAntenna2 = new RfidAntenna(duplexStream, address2);
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
						resolve(tagNumber)
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

		duplexStream.push(`XR[PU001]`);
		duplexStream.push(`X001A[1]`);

		let pickedTagNumber = await pickedTag1Antenna1Promise;

		should(pickedTagNumber).be.equal(1);

		duplexStream.push(`XR[PB001]`);
		duplexStream.push(`X002A[0]`);

		let placedTagNumber = await placedTag1Antenna2Promise;

		should(placedTagNumber).be.equal(1);

		duplexStream.push(`XR[PU002]`);
		duplexStream.push(`X002A[1]`);

		pickedTagNumber = await pickedTag2Antenna2Promise;

		should(pickedTagNumber).be.equal(2);

		duplexStream.push(`XR[PB002]`);
		duplexStream.push(`X002A[0]`);

		placedTagNumber = await placedTag2Antenna2Promise;

		should(placedTagNumber).be.equal(2);

		duplexStream.end();
	});

	it('should get tag numbers on antenna when some are placed', async function() {
		const duplexStream = new MockDuplex();

		const address1 = 7;
		const rfidAntenna1 = new RfidAntenna(duplexStream, address1);

		const tagNumbers = await rfidAntenna1.getPlacedTags();

		should(tagNumbers).be.deepEqual([4, 2]);

		duplexStream.end();
	});

	it('should get tag numbers on antenna when all are placed', async function() {
		const duplexStream = new MockDuplex();

		const address1 = 1;
		const rfidAntenna1 = new RfidAntenna(duplexStream, address1);

		const tagNumbers = await rfidAntenna1.getPlacedTags();

		should(tagNumbers).be.deepEqual([1, 2, 3, 4]);

		duplexStream.end();
	});

	it('should get tag numbers on antenna when none is placed', async function() {
		const duplexStream = new MockDuplex();

		const address1 = 2;
		const rfidAntenna1 = new RfidAntenna(duplexStream, address1);

		const tagNumbers = await rfidAntenna1.getPlacedTags();

		should(tagNumbers).be.deepEqual([]);

		duplexStream.end();
	});

});
