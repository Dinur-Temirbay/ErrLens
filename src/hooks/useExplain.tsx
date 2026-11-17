import { useCallback, useState } from 'react'
import { ExplanationSchema, type Explanation } from '../lib/schema'

export type ExplainState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; data: Explanation }
	| { status: 'error'; error: string }

function messageForStatus(status: number): string {
	if (status === 400) {
		return 'Проверь введённый текст: он пустой или слишком длинный.'
	}
	if (status === 502 || status === 504) {
		return 'Сервис ИИ временно недоступен. Попробуй позже.'
	}
	return 'Что-то пошло не так. Попробуй ещё раз.'
}

export function useExplain() {
	const [state, setState] = useState<ExplainState>({ status: 'idle' })

	const explain = useCallback(async (error: string, code?: string) => {
		setState({ status: 'loading' })

		try {
			const response = await fetch('/api/explain', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ error, code }),
			})

			if (!response.ok) {
				setState({ status: 'error', error: messageForStatus(response.status) })
				return
			}

			const data: unknown = await response.json()
			const parsed = ExplanationSchema.safeParse(data)

			if (!parsed.success) {
				setState({ status: 'error', error: 'Сервер вернул неожиданный ответ.' })
				return
			}

			setState({ status: 'success', data: parsed.data })
		} catch {
			setState({ status: 'error', error: 'Не удалось связаться с сервером.' })
		}
	}, [])

	return { state, explain }
}
