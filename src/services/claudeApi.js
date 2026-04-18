import { QUESTION_COUNT } from '../constants/categories'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

function shuffleArray(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function normalizeQuestions(rawQuestions) {
  if (!Array.isArray(rawQuestions)) return []

  return rawQuestions
    .filter(q => q && typeof q === 'object' && Array.isArray(q.options) && q.options.length === 4)
    .map((q) => {
      const answerIndex = Number.isInteger(q.answer) ? q.answer : Number.parseInt(q.answer, 10)
      const safeIndex = Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < q.options.length ? answerIndex : 0
      const correctOption = q.options[safeIndex]
      const shuffledOptions = shuffleArray(q.options)

      return {
        ...q,
        options: shuffledOptions,
        answer: shuffledOptions.findIndex(opt => opt === correctOption),
      }
    })
}

function buildPrompt(topic, difficulty) {
  return `Generate ${QUESTION_COUNT} ${difficulty} multiple-choice quiz questions for students on ${topic}.
Return ONLY a JSON array, no markdown, no explanation, no code blocks.

Each item must follow this exact format:
{"q":"question text","options":["Option A","Option B","Option C","Option D"],"answer":2,"hint":"short hint","explain":"brief explanation"}

Quality rules:
- Questions must test understanding, reasoning, and application, not just definition recall.
- Do NOT write meta questions like "Which statement best describes ${topic}?" or "In a quiz about ${topic}".
- Use concrete subtopics, concepts, events, formulas, cases, or cause-effect relationships within ${topic}.
- Include at least 2 scenario-based questions that require applying knowledge.
- Include plausible distractors based on common student misconceptions.
- Keep option lengths similar and avoid obvious giveaway answers.
- answer is the index (0-3) of the correct option.
- Distribute correct answer indexes across 0, 1, 2, and 3.
- Make questions genuinely ${difficulty} difficulty.
- Return ONLY the JSON array, nothing else.`
}

export async function generateQuestions(topic, difficulty) {
  if (!API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env. Add it and restart Vite.')
  }

  const prompt = buildPrompt(topic, difficulty)

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' + API_KEY

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1400,
      }
    }),
  })

  if (!response.ok) {
    let detail = 'Gemini API error'
    try {
      const err = await response.json()
      detail = err?.error?.message || detail
    } catch {
      detail = `${detail} (${response.status})`
    }

    if (response.status === 429 || /quota|rate limit|free_tier/i.test(detail)) {
      return { questions: normalizeQuestions(buildFallbackQuestions(topic, difficulty)), source: 'fallback' }
    }

    if (response.status === 403) {
      throw new Error(`Gemini rejected the key (403). Check API restrictions and that Generative Language API is enabled. ${detail}`)
    }

    if (response.status === 400) {
      throw new Error(`Bad Gemini request (400). Verify VITE_GEMINI_API_KEY and model access. ${detail}`)
    }

    throw new Error(detail)
  }

  const data = await response.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!raw) {
    throw new Error('Gemini returned no question text. Try again or change topic/difficulty.')
  }

  const cleaned = raw
    .trim()
    .replace(/```json|```/g, '')
    .trim()

  try {
    const questions = normalizeQuestions(JSON.parse(cleaned))
    if (!questions.length) {
      throw new Error('No valid questions were returned by Gemini. Please retry.')
    }
    return { questions, source: 'api' }
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error('Gemini returned non-JSON output. Please retry the quiz generation.')
    }
    throw e
  }
}

function buildFallbackQuestions(topic, difficulty) {
  const label = topic || 'General Knowledge'
  const difficultyLabel = difficulty || 'medium'

  return [
    {
      q: `A student is revising ${label} and finds two explanations for the same idea. What should they do first to decide which explanation is stronger?`,
      options: [
        'Check evidence, examples, and whether the explanation matches known principles',
        'Pick the explanation with more difficult vocabulary',
        'Choose the shorter explanation to save time',
        'Select randomly because both mention the same topic',
      ],
      answer: 0,
      hint: 'Strong explanations are supported by evidence and accurate reasoning.',
      explain: `In ${label}, reliable conclusions come from evidence and consistency, not style or length.`,
    },
    {
      q: `Which approach best helps a student answer a difficult ${label} question under exam pressure?`,
      options: [
        'Identify key terms, remove clearly wrong options, then compare the remaining choices',
        'Always choose option C to keep a consistent strategy',
        'Ignore units, dates, or context clues in the question',
        'Pick the first option that mentions the main topic word',
      ],
      answer: 0,
      hint: 'Use deliberate reasoning before selecting an answer.',
      explain: 'Careful elimination and comparison improves accuracy on challenging questions.',
    },
    {
      q: `A class is debating a ${label} claim. Which response shows higher-order thinking?`,
      options: [
        'Ask what assumptions are being made and test whether the evidence supports them',
        'Agree with whichever side sounds more confident',
        'Choose the explanation with the longest sentence',
        'Ignore conflicting evidence to keep the argument simple',
      ],
      answer: 0,
      hint: 'Look for assumptions and evidence quality.',
      explain: 'Critical thinking means evaluating assumptions and matching claims to evidence.',
    },
    {
      q: `For ${difficultyLabel} ${label} practice, which question style is most likely to deepen understanding?`,
      options: [
        'Scenario-based questions that require applying ideas to unfamiliar situations',
        'Repeated memorization of one definition without context',
        'Questions that only test spelling of terms',
        'Questions with obviously wrong distractors',
      ],
      answer: 0,
      hint: 'Application questions reveal real understanding.',
      explain: 'Applying concepts in new contexts helps students transfer knowledge beyond recall.',
    },
    {
      q: `A student gets many ${label} questions wrong even after reading notes. What is the most effective next step?`,
      options: [
        'Review why each wrong option is incorrect and identify the misconception pattern',
        'Read the same notes again without solving new questions',
        'Memorize only final answers without explanations',
        'Skip difficult questions to protect confidence',
      ],
      answer: 0,
      hint: 'Use mistakes as feedback data.',
      explain: 'Analyzing errors targets misconceptions and improves future reasoning.',
    },
    {
      q: `Which choice best reflects expert thinking in ${label}?`,
      options: [
        'Use core principles to evaluate all options before choosing the most defensible answer',
        'Prefer options with familiar keywords even if reasoning is weak',
        'Choose quickly and avoid revisiting assumptions',
        'Treat every problem as identical to the previous one',
      ],
      answer: 0,
      hint: 'Experts reason from principles, not shortcuts.',
      explain: `In ${label}, expert decisions are based on structured reasoning and evidence checks.`,
    },
  ]
}
