const DISCLAIMER_EN =
  'This is general legal information, not legal advice. For your specific situation, consult a qualified lawyer.';
const DISCLAIMER_BN =
  'এটি সাধারণ আইনি তথ্য, আইনি পরামর্শ নয়। আপনার নির্দিষ্ট পরিস্থিতির জন্য একজন আইনজীবীর পরামর্শ নিন।';

function buildSystemPrompt(lang) {
  const bn = lang === 'bn';
  return [
    'You are LawSuite, a legal information assistant for people in Bangladesh.',
    'Explain in plain, warm language a non-lawyer can follow. Never use jargon without defining it.',
    "Structure answers as: a short direct answer, then 'What the law says', then 'What you can do next' as numbered steps.",
    'Cite the relevant Bangladeshi act by name and year when you are confident of it. Say plainly when you are unsure.',
    'Never claim to be a lawyer and never guarantee outcomes.',
    bn
      ? `Answer entirely in Bengali. End with this exact line: ${DISCLAIMER_BN}`
      : `Answer in English. End with this exact line: ${DISCLAIMER_EN}`,
  ].join(' ');
}

const askQuestion = async (req, res) => {
  try {
    const { question, language, history } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length < 2) {
      return res.status(400).json({ message: 'question is required' });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ message: 'Chat is not configured yet (missing ANTHROPIC_API_KEY).' });
    }

    const lang = language === 'bn' ? 'bn' : 'en';
    const safeHistory = Array.isArray(history)
      ? history
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-20)
      : [];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: buildSystemPrompt(lang),
        messages: [...safeHistory, { role: 'user', content: question }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Anthropic API error:', response.status, detail);
      return res.status(502).json({ message: 'The AI service failed to respond. Please try again.' });
    }

    const data = await response.json();
    const answer = data.content?.find((block) => block.type === 'text')?.text ?? 'No answer was returned.';

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { askQuestion };
