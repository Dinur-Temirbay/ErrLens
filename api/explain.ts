import { RequestBodySchema } from '../src/lib/schema'
import * as z from 'zod'

export default {
	async fetch(request: Request) {
		if (request.method !== 'POST') {
			return Response.json(
				{ error: 'Method Not Allowed' },
				{ status: 405, headers: { Allow: 'POST' } },
			)
		}

		let body: unknown

		try {
			body = await request.json()
		} catch {
			return Response.json({ error: 'Invalid JSON' }, { status: 400 })
		}

		const result = RequestBodySchema.safeParse(body)
		if (!result.success) {
			const error = z.prettifyError(result.error)
			return Response.json({ error }, { status: 400 })
		}

		return Response.json({ ok: true })
	},
}
