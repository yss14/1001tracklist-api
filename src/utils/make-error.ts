import { HttpStatusCode } from 'azure-functions-ts-essentials';

export const makeError = (status: HttpStatusCode, message: string) => ({
	status,
	body: {
		error: {
			message
		}
	}
});
