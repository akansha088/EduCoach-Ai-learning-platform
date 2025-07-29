import axios from 'axios';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!apiKey) {
  throw new Error('Gemini API key not found. Please check your .env file.');
}

export async function generateResponse(userInput, userContext = { name: 'Student' }) {
  if (!userInput || !userInput.trim()) return '';

  const prompt = `You are an expert AI tutor for an e-learning platform. Your job is to help students with their specific topic doubts. Always provide clear, concise, and educational explanations tailored to the student's question. If the student's doubt is vague, politely ask clarifying questions to better assist them. Use simple language and examples when possible.\n\nStudent Name: ${userContext.name}\n\nStudent's Doubt: ${userInput}`;

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        }
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response from Gemini API');
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(
      error?.response?.data?.error?.message ||
      error?.message ||
      'Failed to generate a response. Please try again.'
    );
  }
}

export default { generateResponse };