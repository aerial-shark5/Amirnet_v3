export async function askClaude(userMessage, systemPrompt) {
  const system = systemPrompt || `You are an English tutor helping an Israeli adult (Hebrew speaker) prepare for the AMIR (אמי"ר) English proficiency test. 
The test has 3 question types: Sentence Completions, Restatements, and Reading Comprehension.
Keep explanations SHORT, clear, and always include a Hebrew translation of the key word/idea.
Format: English explanation (2-3 sentences max), then Hebrew hint in parentheses.
Be warm and encouraging. The student is a 30-year-old IDF officer working hard to pass.`

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system,
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'Error getting response.'
}

export async function explainWord(word, sentence) {
  return askClaude(
    `Explain the English word "${word}" simply for a Hebrew speaker learning English.
${sentence ? `Context sentence: "${sentence}"` : ''}
Give: 1) Simple definition in English, 2) Hebrew translation, 3) One more example sentence.
Be very brief.`
  )
}

export async function explainQuestion(questionText, options, correctAnswer, userAnswer) {
  return askClaude(
    `AMIR test question: "${questionText}"
Options: ${options.map((o, i) => `(${i + 1}) ${o}`).join(', ')}
Correct answer: (${correctAnswer + 1}) ${options[correctAnswer]}
${userAnswer !== undefined ? `Student chose: (${userAnswer + 1}) ${options[userAnswer]}` : ''}

Explain WHY the correct answer is right in 2-3 simple sentences. Include Hebrew keywords.`
  )
}

export async function generateHint(sentence, blankPosition) {
  return askClaude(
    `For this sentence completion question: "${sentence}"
Give ONE helpful hint about what TYPE of word should fill the blank (verb? adjective? connector?).
Look at context clues. Keep it to 1-2 sentences. Include Hebrew translation.`
  )
}
