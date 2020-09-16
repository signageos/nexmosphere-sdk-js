
import * as should from 'should';
import { parseMessage, InvalidArgumentError, UnknownCommandError } from '../../src/MessageParser';

describe('MessageParser', () => {
	const testCases = [
		{
			message: 'X001A[3]',
			expectedCommand: {
				format: 'A',
				command: '3',
				type: 'X',
				address: 1,
			},
		},
		{
			message: 'X001A[3]',
			expectedCommand: {
				format: 'A',
				command: '3',
				type: 'X',
				address: 1,
			},
		},
		{
			message: 'X001A[3]',
			expectedCommand: {
				format: 'A',
				command: '3',
				type: 'X',
				address: 1,
			},
		},
		{
			message: 'X025A[1]',
			expectedCommand: {
				format: 'A',
				command: '1',
				type: 'X',
				address: 25,
			},
		},
		{
			message: 'X999A[1]',
			expectedCommand: {
				format: 'A',
				command: '1',
				type: 'X',
				address: 999,
			},
		},
		{
			message: 'X260A[1]',
			expectedCommand: {
				format: 'A',
				command: '1',
				type: 'X',
				address: 260,
			},
		},
		{
			message: 'XR[PU001]',
			expectedCommand: {
				type: 'antenna',
				command: 'PU',
				tagIndex: 1,
			},
		},
		{
			message: 'XR[PB666]',
			expectedCommand: {
				type: 'antenna',
				command: 'PB',
				tagIndex: 666,
			},
		},
	];
	it('should correctly parse the short command message', () => {
		for (const testCase of testCases) {
			const actualCmd = parseMessage(testCase.message);
			should(actualCmd).be.deepEqual(testCase.expectedCommand);
		}
	});

	it('should throw error the empty command is sent', () => {
		let sampleMessage = '';
		try {
			parseMessage(sampleMessage);
		} catch (error) {
			should(error).be.instanceOf(InvalidArgumentError);
			should(error.message).be.equal('Message is empty.');
		}
	});

	it('should throw error when the unknow command is sent', () => {
		// theoretically can be valid
		// Engineering samples in development (heatmap)
		let sampleMessage = 'XY-430';
		try {
			parseMessage(sampleMessage);
		} catch (error) {
			should(error).be.instanceOf(UnknownCommandError);
			should(error.message).be.equal('Unknown command.');
		}
	});

});
