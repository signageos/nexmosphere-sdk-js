
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
		{
			message: 'X007B[ d001 d002 d000 d000]',
			expectedCommand: {
				type: 'X',
				command: ' d001 d002 d000 d000',
				address: 7,
				format: 'B',
			},
		},
		{
			message: 'X333B[28ba51059318c1d78bc881f296d42e]', // 30 chars in command section
			expectedCommand: {
				type: 'X',
				command: '28ba51059318c1d78bc881f296d42e',
				address: 333,
				format: 'B',
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
		const sampleMessage = '';
		try {
			parseMessage(sampleMessage);
		} catch (error) {
			should(error).be.instanceOf(InvalidArgumentError);
			should(error.message).be.equal('Message is empty.');
		}
	});

	const unknownCommands = [
		{
			message: 'XY-430',
		},
		{
			message: 'X333B[28ba51059318c1d78bc881f296d42e1]', // 31 chars in command section
		}
	];
	it('should throw error when the unknow command is sent', () => {
		for (const unknownCommand of unknownCommands) {
			try {
				parseMessage(unknownCommand.message);
				should(1).be.equal('Should never get there');
			} catch (error) {
				should(error).be.instanceOf(UnknownCommandError);
				should(error.message).be.equal('Unknown command.');
			}
		}
	});

});
