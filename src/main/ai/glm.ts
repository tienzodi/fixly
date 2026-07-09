export async function correctWithGLM(text: string, apiKey: string, systemPrompt: string): Promise<string> {
  if (!apiKey) throw new Error('GLM API key not set. Open Settings to configure.');

  const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-5.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      thinking: { type: 'disabled' },
    }),
  });

  console.log(`[Fixly][glm] HTTP ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const err = await response.text();
    console.error('[Fixly][glm] error body:', err);
    throw new Error(`GLM error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    console.error('[Fixly][glm] unexpected response shape:', JSON.stringify(data).slice(0, 400));
    throw new Error('GLM returned an unexpected response shape.');
  }
  return content.trim();
}
