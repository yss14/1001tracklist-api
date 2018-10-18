import { Context, HttpRequest, HttpResponse, HttpStatusCode, HttpMethod } from 'azure-functions-ts-essentials';
import { JSDOM } from 'jsdom';
import * as rp from 'request-promise';
import { makeError } from '../utils/make-error';
import * as fs from 'fs';

interface ITracklistItem {
	trackTitle: string;
	timestamp: number | null;
}

export const run = async (context: Context, req: HttpRequest): Promise<void> => {
	let res: HttpResponse = { status: HttpStatusCode.OK, body: '' };

	const tracklistURL = req.query.tracklistURL;

	if (tracklistURL === undefined || typeof tracklistURL !== 'string' || tracklistURL.trim().length === 0
		|| !tracklistURL.startsWith('https://www.1001tracklists.com/tracklist/')) {
		res = makeError(HttpStatusCode.BadRequest, 'Query param <tracklistURL> is not valid');
	} else {
		if (req.method === HttpMethod.Get) {
			let rawHTML: string;

			try {
				const options = {
					method: 'GET',
					uri: tracklistURL
				};

				rawHTML = await rp(options);
			} catch (err) {
				context.log(err);

				res = makeError(HttpStatusCode.InternalServerError, `Cannot grab html from ${tracklistURL}`);
			}

			if (rawHTML) {
				fs.writeFileSync('./dump.html', rawHTML);
				const dom = new JSDOM(rawHTML);
				const document = dom.window.document;

				const trackItems = Array.from(document.querySelectorAll('tr.tlpItem')) as HTMLTableRowElement[];

				res = {
					status: HttpStatusCode.OK,
					body: {
						tracks: trackItems
							.map((item): [HTMLSpanElement, HTMLDivElement] =>
								[item.querySelector('span.trackFormat'), item.querySelector('div.cueValueField')])
							.map(([trackSpan, timeDiv]): ITracklistItem => ({
								trackTitle: (trackSpan.innerText || trackSpan.textContent).trim(),
								timestamp: timeDiv
									? timeDiv.innerHTML
										.trim()
										.split(':')
										.map(el => parseInt(el, 10))
										.reverse()
										.reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0)
									: null
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
