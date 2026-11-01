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

const headerRegex = /(?<errorType>\w+): (?<message>.*)$/

export function parseStackTrace(trace: string): ParsedTrace {
	const lines = trace.split(/\r?\n/)

	let errorType: string | undefined
	let message: string | undefined
	const frames: StackFrame[] = []

	for (let i = 0; i < lines.length; i++) {
		const text = lines[i]

		const frame = parseFrame(text)
		if (frame) {
			frames.push(frame)
			continue
		}

		if (i === 0) {
			const header = text.match(headerRegex)
			if (header?.groups) {
				errorType = header.groups.errorType
				message = header.groups.message
			}
		}
	}

	return { errorType, message, frames }
}
