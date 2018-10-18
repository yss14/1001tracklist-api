import { Context, HttpMethod, HttpRequest, HttpResponse, HttpStatusCode } from 'azure-functions-ts-essentials';
import { JSDOM } from 'jsdom';
import * as rp from 'request-promise';
import { makeError } from '../utils/make-error';

interface ITracklistLink {
	title: string;
	link: string;
}

export const run = async (context: Context, req: HttpRequest): Promise<void> => {
	let res: HttpResponse = { status: HttpStatusCode.OK, body: '' };

	const queryString = req.query.query;

	if (queryString === undefined || typeof queryString !== 'string' || queryString.trim().length === 0) {
		res = makeError(HttpStatusCode.BadRequest, 'Query param <query> is not valid');
	} else {
		if (req.method === HttpMethod.Get) {
			let rawHTML: string;

			try {
				const options = {
					method: 'POST',
					uri: 'https://www.1001tracklists.com/search/result.php',
					form: {
						search_selection: 9,
						main_search: queryString
					}
				};

				rawHTML = await rp(options);
			} catch (err) {
				context.log(err);

				res = makeError(HttpStatusCode.InternalServerError, 'Cannot grab html from https://www.1001tracklists.com/search/result.php');
			}

			if (rawHTML) {
				const dom = new JSDOM(rawHTML);
				const document = dom.window.document;

				const tracklistLinkWrappers = Array.from(document.querySelectorAll('div.tlLink')) as HTMLDivElement[];

				res = {
					status: HttpStatusCode.OK,
					body: {
						results: tracklistLinkWrappers
							.map((tlLinkWrapper): HTMLAnchorElement => tlLinkWrapper.querySelector('a') as HTMLAnchorElement)
							.map((child): ITracklistLink => ({
								title: child.innerHTML,
								link: `https://www.1001tracklists.com${child.href}`
							}))
					},
					headers: {
						'content-type': 'application/json'
					}
				};
			}
		} else {
			res = makeError(HttpStatusCode.MethodNotAllowed, `Method ${req.method} not supported.`);
		}
	}

	context.done(undefined, res);
};
