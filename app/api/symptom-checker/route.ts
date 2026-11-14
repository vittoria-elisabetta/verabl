import { generateText, Output, gateway } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const MODEL = gateway('openai/gpt-5-mini')

const trustedSources = [
  { label: 'NHS — Health A to Z', url: 'https://www.nhs.uk/conditions/' },
  { label: 'Mayo Clinic — Diseases and conditions', url: 'https://www.mayoclinic.org/diseases-conditions' },
  { label: 'CDC — Health topics', url: 'https://www.cdc.gov/health-topics.html' },
]

const questionsSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().describe('short snake_case identifier for the question'),
        question: z.string().describe('a simple, plain-language question'),
        options: z
          .array(z.string())
          .min(2)
          .max(5)
          .describe('short answer options the user can pick from'),
      }),
    )
    .min(3)
    .max(4),
})

const resultSchema = z.object({
  summary: z.string().describe('one or two sentence plain-language summary of the situation'),
  urgency: z
    .enum(['self-care', 'see-a-doctor', 'urgent'])
    .describe('overall guidance level based on the answers'),
  possibleExplanations: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .describe('possible non-alarming explanations, framed as possibilities not diagnoses'),
  whatYouCanDo: z.array(z.string()).describe('safe, evidence-based self-care actions'),
  whatToAvoid: z.array(z.string()).describe('things to avoid, including unverified online remedies'),
  whenToSeekHelp: z.array(z.string()).describe('clear red-flag signs that mean the user should seek medical care'),
})

export async function POST(req: Request) {
  let requestStage: unknown
  try {
    const body = await req.json()
    requestStage = body.stage
    const stage: 'questions' | 'result' = body.stage

    if (stage === 'questions') {
      const concern: string = String(body.concern ?? '').slice(0, 500)
      const emergencyPattern = /chest pain|trouble breathing|can't breathe|cannot breathe|face droop|sudden weakness|confusion|severe bleeding|unconscious|seizure/i
      if (emergencyPattern.test(concern)) {
        return Response.json({ questions: [{ id: 'emergency', question: 'This may include a warning sign. Are you experiencing it right now?', options: ['Yes', 'No', 'Not sure'] }] })
      }
      const { output } = await generateText({
        model: MODEL,
        output: Output.object({ schema: questionsSchema }),
        maxRetries: 0,
        timeout: 8000,
        system:
          'You are a careful, calming medical information assistant. You never diagnose. ' +
          'Generate 3 to 4 simple triage questions to better understand the user\u2019s health concern. ' +
          'Questions should cover things like onset/timing, location, severity, and accompanying symptoms where relevant. ' +
          'Use plain, non-alarming language suitable for all ages.',
        prompt: `The user's health concern is: "${concern}". Generate the follow-up questions.`,
      })
      return Response.json(output)
    }

    if (stage === 'result') {
      const concern: string = String(body.concern ?? '').slice(0, 500)
      const answers: { question: string; answer: string }[] = Array.isArray(body.answers)
        ? body.answers.slice(0, 6)
        : []
      const answerText = answers.map((a) => `- ${a.question} -> ${a.answer}`).join('\n')
      const emergencyAnswer = answers.some((answer) => /emergency|warning sign/i.test(answer.question) && /yes|not sure/i.test(answer.answer))
      if (emergencyAnswer || /chest pain|trouble breathing|can't breathe|cannot breathe|face droop|sudden weakness|confusion|severe bleeding|unconscious|seizure/i.test(concern)) {
        return Response.json({ summary: 'Some reported symptoms may require immediate attention. This tool cannot assess emergencies.', urgency: 'urgent', possibleExplanations: [], whatYouCanDo: ['Call your local emergency number now or go to the nearest emergency department.', 'If possible, ask someone to stay with you and do not drive yourself if you feel faint or confused.'], whatToAvoid: ['Do not wait for an online result or attempt to self-diagnose an emergency.'], whenToSeekHelp: ['Seek emergency medical help now.'], references: trustedSources })
      }

      const { output } = await generateText({
        model: MODEL,
        output: Output.object({ schema: resultSchema }),
        maxRetries: 0,
        timeout: 8000,
        system:
          'You are a careful, calming medical information assistant providing EDUCATIONAL guidance only. ' +
          'You never provide a diagnosis or prescribe medication. Frame explanations as possibilities. ' +
          'Always be conservative: when in doubt, recommend seeing a professional. ' +
          'Base guidance on mainstream, evidence-based medicine (WHO, CDC, NHS). Keep language simple and reassuring.',
        prompt:
          `Health concern: "${concern}".\n\nThe user answered:\n${answerText}\n\n` +
          `Produce educational guidance following the schema. Be specific but safe. Ground the guidance in these trusted sources:\n${trustedSources.map((source) => `- ${source.label}: ${source.url}`).join('\n')}`,
      })
      return Response.json(output)
    }

    return Response.json({ error: 'Invalid stage' }, { status: 400 })
  } catch (err) {
    const message = (err as Error).message ?? ''
    console.log('[v0] symptom-checker error:', message)
    const needsBilling = message.includes('credit card') || message.includes('AI Gateway')
    if (requestStage === 'questions') {
      return Response.json({
        questions: [
          { id: 'duration', question: 'When did this concern begin?', options: ['Today', 'A few days ago', 'More than a week ago', 'Not sure'] },
          { id: 'severity', question: 'How would you describe the severity?', options: ['Mild', 'Moderate', 'Severe', 'It comes and goes'] },
          { id: 'red_flags', question: 'Do you have severe pain, trouble breathing, confusion, or sudden weakness?', options: ['Yes', 'No', 'Not sure'] },
        ],
      })
    }

    return Response.json({
      summary: 'This is general educational information, not a diagnosis. A healthcare professional can assess your symptoms in context.',
      urgency: 'see-a-doctor',
      possibleExplanations: [{ title: 'Several conditions can cause similar symptoms', detail: 'Timing, severity, medications, and other health details can change what advice is appropriate.' }],
      whatYouCanDo: ['Write down when symptoms started and whether they are changing.', 'Use the NHS, CDC, or Mayo Clinic links below for condition-specific guidance.', 'Arrange medical advice if symptoms persist or concern you.'],
      whatToAvoid: ['Avoid unverified remedies or taking someone else’s prescription medicine.', 'Do not use this tool to delay urgent medical care.'],
      whenToSeekHelp: ['Seek urgent care for trouble breathing, chest pain, sudden weakness, severe bleeding, confusion, or rapidly worsening symptoms.', 'Contact a healthcare professional if you are unsure or symptoms continue.'],
      references: trustedSources,
    })
  }
}
