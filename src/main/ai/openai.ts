export async function correctWithOpenAI(text: string, apiKey: string, systemPrompt: string): Promise<string> {
  if (!apiKey) throw new Error('OpenAI API key not set. Open Settings to configure.');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
