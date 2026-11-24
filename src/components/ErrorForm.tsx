import { useState } from 'react'

type ErrorFormProps = {
	onSubmit: (error: string, code?: string) => void
	isLoading: boolean
}

export function ErrorForm({ onSubmit, isLoading }: ErrorFormProps) {
	const [error, setError] = useState('')
	const [code, setCode] = useState('')

	const canSubmit = !isLoading && error.trim() !== ''

	function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault()
		if (!canSubmit) return
		onSubmit(error.trim(), code.trim() || undefined)
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor='error'>Error message:</label>
			<textarea
				id='error'
				name='error'
				required
				maxLength={8000}
				value={error}
				onChange={e => setError(e.target.value)}
			></textarea>
			<label htmlFor='code'>Code snippet (optional):</label>
			<textarea
				id='code'
				name='code'
				maxLength={8000}
				value={code}
				onChange={e => setCode(e.target.value)}
			></textarea>
			<button type='submit' disabled={!canSubmit}>
				{isLoading ? 'Loading...' : 'Submit'}
			</button>
		</form>
	)
}
