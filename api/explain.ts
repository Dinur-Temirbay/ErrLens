import { RequestBodySchema } from '../src/lib/schema'
import { parseExplanation } from '../src/lib/parseExplanation'
import * as z from 'zod'

const API_URL =
	'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
const MODEL = 'gemini-3.6-flash'

const SYSTEM_PROMPT = `You explain JavaScript/TypeScript/React errors to junior developers.
Return ONLY valid JSON, no markdown, no code fences, with these fields:
- summary: string, one sentence
- cause: string, why the error happens
- fix: string, how to fix it
- codeFix: string, optional corrected code snippet
- severity: "low" | "medium" | "high"
- docs: array of up to 3 objects { title: string, url: string }
Reference the exact file and line from the stack trace when present.`

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
			const message = z.prettifyError(result.error)
			return Response.json({ error: message }, { status: 400 })
		}

		const apiKey = process.env.GEMINI_API_KEY
		if (!apiKey) {
			console.error('GEMINI_API_KEY is not set')
			return Response.json({ error: 'Server misconfigured' }, { status: 500 })
		}

		const { error, code } = result.data

		const upstream = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: MODEL,
				messages: [
					{ role: 'system', content: SYSTEM_PROMPT },
					{
						role: 'user',
						content: `Error:\n${error}\n\nCode:\n${code ?? '(none)'}`,
					},
				],
			}),
		})

		if (!upstream.ok) {
			console.error('Provider error', upstream.status, await upstream.text())
			return Response.json({ error: 'AI provider error' }, { status: 502 })
		}

		const data = (await upstream.json()) as {
			choices?: { message?: { content?: string } }[]
		}
		const text = data.choices?.[0]?.message?.content

		if (!text) {
			return Response.json({ error: 'Empty AI response' }, { status: 502 })
		}

		const parsed = parseExplanation(text)
		if (!parsed.ok) {
			console.error('Bad model output', parsed.error)
			return Response.json(
				{ error: 'AI returned invalid data' },
				{ status: 502 },
			)
		}

		return Response.json(parsed.data)
	},
}
