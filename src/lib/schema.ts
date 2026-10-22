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
