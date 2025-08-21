// backend/chat.jsw
import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';

export async function chatWithGPT(history) {
  const apiKey = await getSecret("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");

  const messages = [
    { role: "system", content: "You are a friendly and helpful assistant for a website." },
    ...history
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
