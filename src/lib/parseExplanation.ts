import * as z from 'zod'
import { ExplanationSchema, type Explanation } from './schema'

export type ParseResult =
	| { ok: true; data: Explanation }
	| { ok: false; error: string }

export function stripCodeFence(raw: string): string {
	const res = raw
		.trim()
		.replace(/^```\w*\s*/, '')
		.replace(/\s*```$/, '')

	return res
}

export function parseExplanation(raw: string): ParseResult {
	const cleaned = stripCodeFence(raw)

	let json: unknown
	try {
		json = JSON.parse(cleaned)
	} catch {
		return { ok: false, error: 'Response is not valid JSON' }
	}

	const result = ExplanationSchema.safeParse(json)

	if (!result.success) {
		return { ok: false, error: z.prettifyError(result.error) }
	}

	return { ok: true, data: result.data }
}
