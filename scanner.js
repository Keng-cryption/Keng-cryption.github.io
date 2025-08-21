// backend/chat.jsw
import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';

export async function chatWithGPT(history) {
  const apiKey = await getSecret("API key");

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
