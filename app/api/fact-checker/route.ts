import { generateText, Output, gateway } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const MODEL = gateway('openai/gpt-5-mini')

const trustedSources = [
  { label: 'WHO — Vaccines and immunization', url: 'https://www.who.int/health-topics/vaccines-and-immunization' },
  { label: 'CDC — About vaccines', url: 'https://www.cdc.gov/vaccines/basics/index.html' },
  { label: 'NHS — Health A to Z', url: 'https://www.nhs.uk/conditions/' },
  { label: 'Mayo Clinic — Diseases and conditions', url: 'https://www.mayoclinic.org/diseases-conditions' },
]

const schema = z.object({
  claim: z.string().describe('the specific factual claim being assessed'),
  verdict: z.enum(['supported', 'partially-supported', 'misleading', 'unsupported', 'false']),
  rating: z.enum(['true', 'mostly-true', 'misleading', 'false', 'unverified']),
  headline: z.string().describe('a plain-language verdict, max 12 words'),
  explanation: z.string().describe('a straightforward explanation of what the evidence says'),
  scientificContext: z.string().describe('relevant medical context for a non-specialist'),
  evidenceStrength: z.enum(['strong', 'moderate', 'limited', 'insufficient']),
  evidence: z.array(z.string()).describe('specific evidence points, without invented statistics'),
  limitations: z.array(z.string()).describe('uncertainty, gaps, or important limitations'),
  references: z.array(z.object({ label: z.string(), title: z.string(), url: z.string(), date: z.string() })),
})

export async function POST(req: Request) {
  let submittedClaim = ''
  try {
    const body = await req.json()
    const claim: string = String(body.claim ?? '').slice(0, 800)
    const sourceUrl = String(body.sourceUrl ?? '').slice(0, 500)
    submittedClaim = claim
    if (!claim.trim()) {
      return Response.json({ error: 'Please enter a claim.' }, { status: 400 })
    }

    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema }),
      maxRetries: 0,
      timeout: 8000,
      system:
        'You are a rigorous medical fact-checker. Assess health claims commonly seen on social media against ' +
        'mainstream, evidence-based medicine (WHO, CDC, NHS, NIH, peer-reviewed literature). ' +
        'Be fair and precise. Use "unverified" when there is not enough reliable evidence either way. ' +
        'Never spread misinformation, and never present a dangerous claim as safe. ' +
        'Provide real, well-known reference URLs from reputable organisations. Keep language clear and non-judgmental.',
      prompt: `Fact-check this health claim seen online: "${claim}"${sourceUrl ? `\nOriginal post link (treat as the claim's context, not as medical evidence): ${sourceUrl}` : ''}\n\nUse these trusted source homepages as the evidence frame and include only references that genuinely support your explanation:\n${trustedSources.map((source) => `- ${source.label}: ${source.url}`).join('\n')}`, 
    })

    return Response.json(output)
  } catch (err) {
    const message = (err as Error).message ?? ''
    console.log('[v0] fact-checker error:', message)
    const needsBilling = message.includes('credit card') || message.includes('AI Gateway')
    return Response.json({
      claim: submittedClaim,
      verdict: 'unsupported',
      rating: 'unverified',
      headline: 'This claim needs checking against trusted medical guidance.',
      explanation: needsBilling
        ? 'The live AI checker is temporarily unavailable, so this result uses a conservative safety fallback. Do not rely on social media claims for diagnosis or treatment decisions.'
        : 'We could not complete the live analysis, so this conservative result avoids guessing. Compare the claim with the trusted medical sources below or speak with a qualified clinician.',
      scientificContext: 'Health claims need to be assessed against current guidance and higher-quality research, not anecdotes alone.',
      evidenceStrength: 'insufficient',
      evidence: [
        'A single post, video, or testimonial is not enough to establish that a health claim is true.',
        'Reliable health guidance should be supported by current evidence from established medical organizations.',
      ],
      limitations: ['The live evidence review was unavailable, so this result does not determine whether the submitted claim is true or false.'],
      references: trustedSources.map((source) => ({ ...source, title: source.label, date: 'See source for current review date' })), 
    })
  }
}
