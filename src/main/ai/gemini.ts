export async function correctWithGemini(text: string, apiKey: string, systemPrompt: string): Promise<string> {
  if (!apiKey) throw new Error('Gemini API key not set. Open Settings to configure.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text }] }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}
