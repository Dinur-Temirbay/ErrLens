import { ErrorForm } from './components/ErrorForm'
import { useExplain } from './hooks/useExplain'

function App() {
	const { explain, state } = useExplain()

	return (
		<div className='p-4'>
			<ErrorForm onSubmit={explain} isLoading={state.status === 'loading'} />
			<pre className='mt-4 whitespace-pre-wrap wrap-break-words text-sm'>
				{JSON.stringify(state, null, 2)}
			</pre>
		</div>
	)
}

export default App
