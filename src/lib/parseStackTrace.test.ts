import { describe, it, expect } from 'vitest'
import { parseFrame, parseStackTrace } from './parseStackTrace'

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

describe('parseStackTrace', () => {
	it('parses a full Chrome trace', () => {
		const trace = `TypeError: Cannot read properties of undefined (reading 'map')
    at List (http://localhost:5173/src/List.tsx:12:20)
    at http://localhost:5173/src/main.tsx:8:3`

		const result = parseStackTrace(trace)

		expect(result.errorType).toBe('TypeError')
		expect(result.message).toBe(
			"Cannot read properties of undefined (reading 'map')",
		)
		expect(result.frames).toHaveLength(2)
	})
	it('parses trace without header', () => {
		const trace = `   at List (http://localhost:5173/src/List.tsx:12:20)
    at http://localhost:5173/src/main.tsx:8:3`

		const result = parseStackTrace(trace)
		expect(result.errorType).toBeUndefined()
		expect(result.frames).toEqual([
			{
				fn: 'List',
				file: 'http://localhost:5173/src/List.tsx',
				line: 12,
				col: 20,
			},
			{
				fn: undefined,
				file: 'http://localhost:5173/src/main.tsx',
				line: 8,
				col: 3,
			},
		])
	})
	it('returns empty frames for empty string', () => {
		const result = parseStackTrace('')
		expect(result.errorType).toBeUndefined()
		expect(result.frames).toEqual([])
	})
	it('skips garbage line between frames', () => {
		const trace = `    at List (http://localhost:5173/src/List.tsx:12:20)
hello world
    at http://localhost:5173/src/main.tsx:8:3`

		const result = parseStackTrace(trace)

		expect(result.frames).toHaveLength(2)
		expect(result.frames[0].fn).toBe('List')
		expect(result.frames[1].fn).toBeUndefined()
	})
	it('parses header without frames', () => {
		const result = parseStackTrace('Error: boom')
		expect(result.errorType).toBe('Error')
		expect(result.message).toBe('boom')
		expect(result.frames).toEqual([])
	})
})
