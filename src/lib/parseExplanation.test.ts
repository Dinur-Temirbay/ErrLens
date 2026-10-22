import { describe, it, expect } from 'vitest'
import { parseExplanation } from './parseExplanation'

const valid = {
	summary: 'test',
	cause: 'test',
	fix: 'test',
	severity: 'low',
	docs: [],
}

describe('parseExplanation', () => {
	it('parses valid JSON', () => {
		const result = parseExplanation(JSON.stringify(valid))
		expect(result.ok).toBe(true)
	})
	it('returns error for non-JSON input', () => {
		const result = parseExplanation('not json')
		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(result.error).toBe('Response is not valid JSON')
		}
	})
	it('returns error when severity is not allowed', () => {
		const result = parseExplanation(
			JSON.stringify({ ...valid, severity: 'critical' }),
		)
		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(result.error).toContain('severity')
		}
	})
	it('parses JSON wrapped in code fence', () => {
		const result = parseExplanation(
			'```json\n' + JSON.stringify(valid) + '\n```',
		)
		expect(result.ok).toBe(true)
		if (result.ok) {
			expect(result.data).toEqual(valid)
		}
	})
	it('accepts null codeFix', () => {
		const result = parseExplanation(JSON.stringify({ ...valid, codeFix: null }))
		expect(result.ok).toBe(true)
	})
})
