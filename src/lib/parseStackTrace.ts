export type StackFrame = {
	fn?: string
	file: string
	line: number
	col: number
}
export type ParsedTrace = {
	errorType?: string
	message?: string
	frames: StackFrame[]
}

const regex =
	/^\s*at (?:async\s+)?(?:(?<fn>.*?)\s+\()?(?<file>.*?):(?<line>\d+):(?<col>\d+)\)?$/

export function parseFrame(line: string): StackFrame | null {
	const match = line.match(regex)
	if (!match || !match.groups) {
		return null
	}

	const { fn, file, line: lineStr, col: colStr } = match.groups

	return {
		fn: fn || undefined,
		file,
		line: Number(lineStr),
		col: Number(colStr),
	}
}
