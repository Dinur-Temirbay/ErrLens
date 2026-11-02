import * as z from 'zod'

export const ExplanationSchema = z.object({
	summary: z.string(),
	cause: z.string(),
	fix: z.string(),
	codeFix: z.string().nullish(),
	severity: z.enum(['low', 'medium', 'high']),
	docs: z.array(z.object({ title: z.string(), url: z.url() })).max(3),
})

export type Explanation = z.infer<typeof ExplanationSchema>

export const RequestBodySchema = z.object({
	error: z.string().trim().min(1, 'Paste an error first').max(8000),
	code: z.string().max(8000).optional(),
})

export type RequestBody = z.infer<typeof RequestBodySchema>
