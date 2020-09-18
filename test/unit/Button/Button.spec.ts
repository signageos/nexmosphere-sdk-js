
import * as should from 'should';
import Button, { ButtonActions, isButtonPressed } from '../../../src/Button';
import { SerialPortEvent } from '../../../src/ISerialPort';
import { waitUntil, wait } from '../../helper';
import MockSerialPort from '../MockSerialPort';

describe('Button', () => {

	describe('isButtonPressed', () => {

		it('should compute correctly when no button is pressed', () => {
			const value = 0;
			const buttonIndices = [0, 1, 2, 3];
			buttonIndices.forEach((bIdx: number) => {
				const actual = isButtonPressed(value, bIdx);
				should(actual).be.equal(false);
			});
		});

		it('should compute correctly when button 1 is pressed', () => {
			/**
			 * `value` means that the first button is pressed
			 */
			const value = 3;
			const firstButtonIndex = 0;
			const otherIndices = [1, 2, 3];

			should(isButtonPressed(value, firstButtonIndex)).be.equal(true);

			otherIndices.forEach((bIdx: number) => {
				const actual = isButtonPressed(value, bIdx);
				should(actual).be.equal(false);
			});
		});

		it('should compute correctly when button 4 is pressed', () => {
			const value = 17;
			const firstButtonIndex = 3;
			const otherIndices = [0, 1, 2];

			should(isButtonPressed(value, firstButtonIndex)).be.equal(true);

			otherIndices.forEach((bIdx: number) => {
				const actual = isButtonPressed(value, bIdx);
				should(actual).be.equal(false);
			});
		});

		it('should compute correctly when button 2 is pressed', () => {
			const value = 5;
			const firstButtonIndex = 1;
			const otherIndices = [0, 2, 3];

			should(isButtonPressed(value, firstButtonIndex)).be.equal(true);

			otherIndices.forEach((bIdx: number) => {
				const actual = isButtonPressed(value, bIdx);
				should(actual).be.equal(false);
			});
		});

		it('should compute correctly when button 3 is pressed', () => {
			const value = 9;
			const firstButtonIndex = 2;
			const otherIndices = [0, 1, 3];

			should(isButtonPressed(value, firstButtonIndex)).be.equal(true);

			otherIndices.forEach((bIdx: number) => {
				const actual = isButtonPressed(value, bIdx);
				should(actual).be.equal(false);
			});
		});

		it('should correctly compute when buttons 1, 4 are pressed', () => {
			// '1 0 0 1     1'
			//  ^     ^     ^
			//  4btn  1btn  pressed
			const value = 19;
			const firstButtonIndex = 0;
			const forthButtonIndex = 3;
			const otherIndices = [1, 2];

			should(isButtonPressed(value, firstButtonIndex)).be.equal(true);
			should(isButtonPressed(value, forthButtonIndex)).be.equal(true);
			otherIndices.forEach((bIdx: number) => should(isButtonPressed(value, bIdx)).be.equal(false));
		});

		it('should correctly compute when buttons 1, 2 are pressed', () => {
			const value = 7; // 00111
			const firstButtonIndex = 0;
			const secondButtonIndex = 1;
			const otherIndices = [2, 3];

			should(isButtonPressed(value, firstButtonIndex)).be.equal(true);
			should(isButtonPressed(value, secondButtonIndex)).be.equal(true);
			otherIndices.forEach((bIdx: number) => should(isButtonPressed(value, bIdx)).be.equal(false));
		});

		it('should correctly compute when buttons 1, 3 are pressed', () => {
			const value = 11; // 01011
			const firstButtonIndex = 0;
			const thirdButtonIndex = 2;
			const otherIndices = [1, 3];

			should(isButtonPressed(value, firstButtonIndex)).be.equal(true);
			should(isButtonPressed(value, thirdButtonIndex)).be.equal(true);
			otherIndices.forEach((bIdx: number) => should(isButtonPressed(value, bIdx)).be.equal(false));
		});

		it('should correctly compute when buttons 2, 3 are pressed', () => {
			const value = 13; // 01101
			const secondButtonIndex = 1;
			const thirdButtonIndex = 2;
			const otherIndices = [0, 3];

			should(isButtonPressed(value, secondButtonIndex)).be.equal(true);
			should(isButtonPressed(value, thirdButtonIndex)).be.equal(true);
			otherIndices.forEach((bIdx: number) => should(isButtonPressed(value, bIdx)).be.equal(false));
		});

		it('should correctly compute when buttons 3, 4 are pressed', () => {
			const value = 25; // 11001
			const thirdButtonIndex = 2;
			const forthButtonIndex = 3;
			const otherIndices = [0, 1];

			should(isButtonPressed(value, thirdButtonIndex)).be.equal(true);
			should(isButtonPressed(value, forthButtonIndex)).be.equal(true);
			otherIndices.forEach((bIdx: number) => should(isButtonPressed(value, bIdx)).be.equal(false));
		});

		it('should correctly compute when buttons 1, 2, 3 are pressed', () => {
			const value = 15; // 01111
			const pressedButtons = [0, 1, 2];
			const nonPressedButton = 3;
			pressedButtons.forEach((bIdx: number) => should(isButtonPressed(value, bIdx)).be.equal(true));
			should(isButtonPressed(value, nonPressedButton)).be.equal(false);
		});

		it('should correctly compute when buttons 2, 3, 4 are pressed', () => {
			const value = 29; // 11101
			const pressedButtons = [1, 2, 3];
			const nonPressedButton = 0;
			pressedButtons.forEach((bIdx: number) => should(isButtonPressed(value, bIdx)).be.equal(true));
			should(isButtonPressed(value, nonPressedButton)).be.equal(false);
		});

		it('should correctly compute when buttons 1, 2, 3, 4 are pressed', () => {
			const value = 31; // 11111
			const pressedButtons = [1, 2, 3];
			pressedButtons.forEach((bIdx: number) => should(isButtonPressed(value, bIdx)).be.equal(true));
		});

		it('should correctly compute when errors happen', () => {
			const value = 30; // 11110
			should(isButtonPressed(value, 0)).be.equal(false);
			should(isButtonPressed(value, 1)).be.equal(false);
			should(isButtonPressed(value, 2)).be.equal(false);
			should(isButtonPressed(value, 3)).be.equal(false);
		});
	});

	describe('Button.events', () => {

		it('should correctly emit on pressed/released events', async function() {
			const serialPort = new MockSerialPort();
			const address = 1;
			const index = 0;
			const button = new Button(serialPort, address, index);
			const buttonPressedPromise = new Promise((resolve: (x: boolean) => void) => {
				button
					.on(ButtonActions.Pressed, () => {
						resolve(true);
					});
			});
			const buttonReleasedPromise = new Promise((resolve: (x: boolean) => void) => {
				button
					.on(ButtonActions.Pressed, () => {
						resolve(true);
					});
			});

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[3]');

			let buttonPressed = await buttonPressedPromise;

			should(buttonPressed).be.true();

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[0]');

			let buttonReleased = await buttonReleasedPromise;

			should(buttonReleased).be.true();
		});

		it('should correctly emit pressed/relesed events when multiple buttons are pressed', async function() {
			const serialPort = new MockSerialPort();

			const address1 = 1;
			const index1 = 0;
			const address2 = 1;
			const index2 = 1;

			const button1 = new Button(serialPort, address1, index1);
			let i1 = 0;
			const button2 = new Button(serialPort, address2, index2);
			let i2 = 0;

			button1
				.on(ButtonActions.Pressed, () => {
					i1 += 1;
				})
				.on(ButtonActions.Released, () => {
					i1 -= 1;
				});

			button2
				.on(ButtonActions.Pressed, () => {
					i2 += 1;
				})
				.on(ButtonActions.Released, () => {
					i2 -= 1;
				});

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[3]');

			await waitUntil(async () => {
				return i1 === 1 && i2 === 0;
			});

			should(i1).be.equal(1);
			should(i2).be.equal(0);

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[7]');

			await waitUntil(async () => {
				return i1 === 1 && i2 === 1;
			});

			should(i1).be.equal(1);
			should(i2).be.equal(1);

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[0]');

			await waitUntil(async () => {
				return i1 === 0 && i2 === 0;
			});

			should(i1).be.equal(0);
			should(i2).be.equal(0);

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[31]'); // 11111

			await waitUntil(async () => {
				return i1 === 1 && i2 === 1;
			});

			should(i1).be.equal(1);
			should(i2).be.equal(1);

			// 3rd & 4th button pressed 1st & 2d released
			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[25]');

			await waitUntil(async () => {
				return i1 === 0 && i2 === 0;
			});

			should(i1).be.equal(0);
			should(i2).be.equal(0);
		});

		it('should correctly emit events when all buttons are pressed/released', async function() {
			const serialPort = new MockSerialPort();

			const address = 1;
			const index1 = 0;
			const index2 = 1;
			const index3 = 2;
			const index4 = 3;

			const button1 = new Button(serialPort, address, index1);
			let i1 = 0;
			const button1PressedCallBack = () => i1 += 1;
			const button1ReleasedCallBack = () => i1 -= 1;
			const button2 = new Button(serialPort, address, index2);
			let i2 = 0;
			const button2PressedCallBack = () => i2 += 1;
			const button2ReleasedCallBack = () => i2 -= 1;
			const button3 = new Button(serialPort, address, index3);
			let i3 = 0;
			const button3PressedCallBack = () => i3 += 1;
			const button3ReleasedCallBack = () => i3 -= 1;
			const button4 = new Button(serialPort, address, index4);
			let i4 = 0;
			const button4PressedCallBack = () => i4 += 1;
			const button4ReleasedCallBack = () => i4 -= 1;

			button1.on(ButtonActions.Pressed, button1PressedCallBack).on(ButtonActions.Released, button1ReleasedCallBack);
			button2.on(ButtonActions.Pressed, button2PressedCallBack).on(ButtonActions.Released, button2ReleasedCallBack);
			button3.on(ButtonActions.Pressed, button3PressedCallBack).on(ButtonActions.Released, button3ReleasedCallBack);
			button4.on(ButtonActions.Pressed, button4PressedCallBack).on(ButtonActions.Released, button4ReleasedCallBack);

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[31]');

			await waitUntil(async () => i1 === 1 && i2 === 1 && i3 === 1 && i4 === 1);

			should(i1).be.equal(1);
			should(i2).be.equal(1);
			should(i3).be.equal(1);
			should(i4).be.equal(1);

			// 2nd & 3rd buttons are pressed other released
			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[13]');

			await waitUntil(async () => i1 === 0 && i2 === 1 && i3 === 1 && i4 === 0);

			should(i1).be.equal(0);
			should(i2).be.equal(1);
			should(i3).be.equal(1);
			should(i4).be.equal(0);

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[0]');

			/// only 2nd & 3rd were released other were already released so we trigger released precisely
			await waitUntil(async () => i1 === 0 && i2 === 0 && i3 === 0 && i4 === 0);

			should(i1).be.equal(0);
			should(i2).be.equal(0);
			should(i3).be.equal(0);
			should(i4).be.equal(0);

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[3]');

			await waitUntil(async () => i1 === 1 && i2 === 0 && i3 === 0 && i4 === 0);

			should(i1).be.equal(1);
			should(i2).be.equal(0);
			should(i3).be.equal(0);
			should(i4).be.equal(0);
		});
	});

	describe('Button.isPressed', () => {

		it('should return true when button is currently pressed', async function () {
			const serialPort = new MockSerialPort();
			const button = new Button(serialPort, 1, 0);
			const isPressedPromise = button.isPressed();

			await wait(10);
			const sentMessages = serialPort.getSentMessages();
			should(sentMessages).deepEqual(['X001A[]']);

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[3]');
			const isPressed = await isPressedPromise;
			should(isPressed).be.true();
		});

		it('should return false when button is not currently pressed', async function () {
			const serialPort = new MockSerialPort();
			const button = new Button(serialPort, 1, 0);
			const isPressedPromise = button.isPressed();

			await wait(10);
			const sentMessages = serialPort.getSentMessages();
			should(sentMessages).deepEqual(['X001A[]']);

			serialPort.emit(SerialPortEvent.MESSAGE, 'X001A[0]');
			const isPressed = await isPressedPromise;
			should(isPressed).be.false();
		});
	});
});
