import { debounceAction } from '../../../src/util/debounce';
import * as should from 'should';
import * as sinon from 'sinon';

describe('util.debounce', () => {

	describe('debounceAction', () => {

		it('should execute one action', async () => {
			const clock = sinon.useFakeTimers();

			const num1 = 10;
			const num2 = 5;
			let sum = 0;

			const timeout = 100;

			const sumNumbers = debounceAction((a: number, b: number) => {
				sum += a + b;
			}, timeout);

			sumNumbers(num1, num2);
			clock.tick(timeout);

			should(sum).be.equal(15);

			clock.restore();
		});

		it('should debounce some action and execute it only once within given timeout', async () => {
			const clock = sinon.useFakeTimers();
			const num1 = 10;
			const num2 = 5;
			let sum = 0;

			const timeout = 100;

			const sumNumbers = debounceAction((a: number, b: number) => {
				sum += a + b;
			}, timeout);

			sumNumbers(num1, num2);
			sumNumbers(num1, num2);
			sumNumbers(num1, num2);
			clock.tick(timeout);

			should(sum).be.equal(15);

			clock.restore();
		});

		it('should execute action only once and take the last action', async () => {
			const clock = sinon.useFakeTimers();
			const num1 = 42;
			const num2 = 13;
			let sum = 0;

			const timeout = 100;

			const sumNumbers = debounceAction((a: number, b: number) => {
				sum += a + b;
			}, timeout);

			sumNumbers(num1, num2);
			sumNumbers(num1, num2);
			sumNumbers(num1, num2);
			clock.tick(timeout);

			should(sum).be.equal(55);

			sumNumbers(num1, num2);
			sumNumbers(num1, num2);
			sumNumbers(-5, -50);
			clock.tick(timeout);

			should(sum).be.equal(0);

			clock.restore();
		});

	});
});
