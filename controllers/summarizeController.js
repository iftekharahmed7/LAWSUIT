function buildSystemPrompt(lang) {
  const bn = lang === 'bn';
  return [
    'You summarize legal and official documents (contracts, notices, agreements) into plain language for people in Bangladesh who are not lawyers.',
    'Structure your response as: a one-sentence plain summary of what the document is, then "Key points" as a short bullet list (what it obligates the reader to do, key dates/amounts, anything unusual or one-sided), then "Questions worth asking" as 2-3 bullets a non-lawyer should raise before signing or responding.',
    'Do not invent details that are not in the text. If the document is incomplete or unclear, say so plainly rather than guessing.',
    'Never claim to be a lawyer and never say the document is "safe to sign" - only describe what it says.',
    bn ? 'Answer entirely in Bengali.' : 'Answer in English.',
  ].join(' ');
}

const summarizeDocument = async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 30) {
      return res.status(400).json({ message: 'Please paste at least a few sentences of document text.' });
    }
    if (text.length > 20000) {
      return res.status(400).json({ message: 'That document is too long - please paste a shorter excerpt.' });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ message: 'Summarisation is not configured yet (missing ANTHROPIC_API_KEY).' });
    }

    const lang = language === 'bn' ? 'bn' : 'en';

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
        messages: [{ role: 'user', content: `Summarize this document:\n\n${text}` }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Anthropic API error:', response.status, detail);
      return res.status(502).json({ message: 'The AI service failed to respond. Please try again.' });
    }

    const data = await response.json();
    const summary = data.content?.find((block) => block.type === 'text')?.text ?? 'No summary was returned.';

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { summarizeDocument };
