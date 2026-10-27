import { describe, it, expect } from 'vitest'
import { parseFrame } from './parseStackTrace'

describe('parseFrame', () => {
	it('parses frame with function name', () => {
		const result = parseFrame(
			'    at fnName (http://localhost:5173/src/App.tsx:12:5)',
		)
		expect(result).toEqual({
			fn: 'fnName',
			file: 'http://localhost:5173/src/App.tsx',
			col: 5,
			line: 12,
		})
	})
	it('frame without function', () => {
		const result = parseFrame('    at http://localhost:5173/src/App.tsx:8:3')
		expect(result).toEqual({
			fn: undefined,
			file: 'http://localhost:5173/src/App.tsx',
			col: 3,
			line: 8,
		})
	})
	it('returns null for non-frame line', () => {
		expect(parseFrame('hello world')).toBeNull()
	})
	it('frame with async', () => {
		const result = parseFrame('    at async Foo.bar (http://x.com/a.ts:1:2)')
		expect(result).toEqual({
			fn: 'Foo.bar',
			file: 'http://x.com/a.ts',
			line: 1,
			col: 2,
		})
	})
})
