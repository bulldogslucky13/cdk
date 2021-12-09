import { ApiHandler } from '../../handlers/api-handler';
import { SuccessResponse } from '../../response/success-response';

interface User {
	id: string;
	name: string;
}

interface PutUserQuery {
	force?: boolean;
}

describe('Api Handler', () => {
	test('Api Handler validates', async () => {
		const bodyValidator = jest.fn((input: any) => {
			return input as User;
		});

		const queryValidator = jest.fn((input: any) => {
			return input as PutUserQuery;
		});

		const handler = ApiHandler(
			{
				method: 'PUT',
				route: '/users/{userId}',
				validators: {
					body: bodyValidator,
					query: queryValidator,
				},
			},
			async (event) => {
				const user = event.input.body;
				const { force = false } = event.input.query;

				return SuccessResponse({ user, force });
			},
		);
		const requestBody = {
			id: '545467',
			name: 'jeremy',
		};

		const response = await handler(
			{
				queryStringParameters: { force: true },
				body: JSON.stringify(requestBody),
			} as any,
			{} as any,
			() => {},
		);

		expect(response).toBeTruthy();
		expect(bodyValidator).toBeCalledWith(requestBody);
		expect(queryValidator).toBeCalledWith({ force: true });
		if (response) {
			expect(response).toEqual({
				body: JSON.stringify({
					user: requestBody,
					force: true,
				}),
				statusCode: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	});

	test('Api Handler Handles Invalid Requests', async () => {
		const bodyValidator = jest.fn((): User => {
			throw new Error('Invalid body');
		});

		const handler = ApiHandler(
			{
				method: 'PUT',
				route: '/users/{userId}',
				validators: {
					body: bodyValidator,
				},
			},
			async (event) => {
				const user = event.input.body;

				return SuccessResponse({ user });
			},
		);
		const requestBody = {
			id: '545467',
			name: 'jeremy',
		};

		const response = await handler(
			{
				queryStringParameters: { force: true },
				body: JSON.stringify(requestBody),
			} as any,
			{} as any,
			() => {},
		);

		expect(bodyValidator).toThrow();
		expect(response).toBeTruthy();
		if (response && typeof response !== 'string') {
			expect(response.statusCode).toEqual(500);
			const body = JSON.parse(response.body ?? '{}');
			expect(body.error.message).toEqual('Invalid body');
		}
	});
});

export {};
